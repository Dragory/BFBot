const util = require('./util');
const Setting = require('./models/Setting');

const defaults = {
	'roles.autoDeleteMessages': {
		value: true,
		types: ['boolean']
	},
	'roles.autoDeleteOtherMessages': {
		value: false,
		types: ['boolean']
	},
	'roles.autoDeleteDelay': {
		value: 7,
		types: ['number']
	},
	'roles.autoDeleteListDelay': {
		value: 10,
		types: ['number']
	}
};

const unserialize = (serializedValue) => {
	let value;

	try { value = JSON.parse(serializedValue); }
	catch (e) { value = serializedValue; }

	return value;
};

const getSettingValue = (setting, key) => {
	if (! setting) return defaults[key].value;

	const value = unserialize(setting.value);
	if (defaults[key].types.indexOf(typeof value) === -1) return defaults[key].value;

	return value;
};

const isValidType = (key, value) => {
	value = unserialize(value);
	return (defaults[key].types.indexOf(typeof value) !== -1);
};

const get = (guildId, key) => {
	if (typeof defaults[key] === 'undefined') return Promise.reject(new Error(`Unknown setting "${key}"`));

	return Setting.query()
		.where('guild_id', guildId)
		.where('key', key)
		.first()
		.then(setting => getSettingValue(setting, key));
};

const getMultiple = (guildId, keys) => {
	return Setting.query()
		.where('guild_id', guildId)
		.whereIn('key', keys)
		.then(rows => {
			const settingsByKey = util.indexBy(rows, 'key');

			return keys.reduce((map, key) => {
				map[key] = getSettingValue(settingsByKey[key], key);
				return map;
			}, {});
		});
};

const set = (guildId, key, value) => {
	if (! isValidType(key, value)) {
		const allowedTypes = getTypes(key).map(type => `'${type}'`);
		return Promise.reject(new Error(`Invalid type for setting "${key}" (expected ${util.prettyList(allowedTypes, ' or ')})`));
	}

	return Setting.query()
		.where('guild_id', guildId)
		.where('key', key)
		.first()
		.then(result => {
			if (result === null) {
				// New setting
				return Setting.query()
					.insert({
						guild_id: guildId,
						key: key,
						value: value
					})
					.execute();
			} else {
				// Update existing setting
				return Setting.query()
					.where('id', result.id)
					.update({
						key: key,
						value: value
					})
					.execute();
			}
		});
};

const getAll = (guildId) => {
	return getMultiple(guildId, Object.keys(defaults));
};

const reset = (guildId, key) => {
	return Setting.query()
		.where('guild_id', guildId)
		.where('key', key)
		.delete()
		.execute();
};

const getTypes = key => {
	if (typeof defaults[key] === 'undefined') return Promise.reject(new Error(`Unknown setting "${key}"`));

	return defaults[key].types;
};

module.exports = {get, set, getMultiple, reset, getAll, getTypes};