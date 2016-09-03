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
	'roles.autoDeleteResponseDelay': {
		value: 5,
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
		throw new Error(`Invalid type for setting "${key}"`);
	}

	return Setting.query()
		.insert({
			guild_id: guildId,
			key: key,
			value: value
		});
};

const reset = (guildId, key) => {
	return Setting.query()
		.where('guild_id', guildId)
		.where('key', key)
		.delete()
		.execute();
};

module.exports = {get, set, getMultiple, reset};