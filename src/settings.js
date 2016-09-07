const util = require('./util');
const Setting = require('./models/Setting');
const defaults = require('./defaultSettings');

const serialize = (value) => {
	return JSON.stringify(value);
};

const unserialize = (serializedValue) => {
	return JSON.parse(serializedValue);
};

// Returns the type of the given setting value
// At the moment this is basically just typeof with a custom type for null/undefined
const getType = (value) => {
	if (value == null) return 'null';
	return typeof value;
};

const isValidType = (key, value) => {
	const type = getType(value);
	return (defaults[key].types.indexOf(type) !== -1);
};

// Unserializes and returns the given setting's value
// If the setting doesn't exist or the value is of an invalid type, return the default value instead
const getSettingValue = (setting, key) => {
	if (! setting) return defaults[key].value;

	const value = unserialize(setting.value);
	if (! isValidType(key, value)) return defaults[key].value;

	return value;
};

const get = (guildId, key) => {
	if (typeof defaults[key] === 'undefined') {
		return Promise.reject(new Error(`Unknown setting "${key}"`));
	}

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

const getAll = (guildId) => {
	return getMultiple(guildId, Object.keys(defaults));
};

const set = (guildId, key, value) => {
	if (! isValidType(key, value)) {
		const allowedTypes = getTypes(key).map(type => `'${type}'`);
		const type = getType(value);

		return Promise.reject(new Error(`Invalid type for setting "${key}" (expected ${util.prettyList(allowedTypes, ' or ')}, got '${type}')`));
	}

	const serialized = serialize(value);

	return Setting.query()
		.where('guild_id', guildId)
		.where('key', key)
		.first()
		.then(result => {
			if (result == null) {
				// New setting
				return Setting.query()
					.insert({
						guild_id: guildId,
						key: key,
						value: serialized
					})
					.execute();
			} else {
				// Update existing setting
				return Setting.query()
					.where('guild_id', result.guild_id)
					.where('key', result.key)
					.update({
						key: key,
						value: serialized
					})
					.execute();
			}
		});
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

module.exports = {
	get, getMultiple, getAll,
	set,
	reset,
	getTypes,
	serialize, unserialize,
};
