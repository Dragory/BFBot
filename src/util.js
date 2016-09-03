const recursiveAssign = (target, ...sources) => {
	return sources.reduce((target, source) => {
		for (const key in source) {
			if (! source.hasOwnProperty(key)) continue;

			const value = source[key];

			// Undefined/null
			if (value == null) target[key] = value;
			// Clone dates
			else if (value instanceof Date) target[key] = new Date(value.getTime());
			// Array
			else if (Array.isArray(value)) {
				// Concat if possible
				if (Array.isArray(target[key])) target[key] = target[key].concat(value);
				else target[key] = value;
			}
			// Objects
			else if (typeof value === 'object') {
				// Extend recursively if applicable 
				if (typeof target[key] === 'object') target[key] = recursiveAssign(target[key], value);
				else target[key] = value;
			}
			// Scalar
			else target[key] = value;
		}

		return target;
	}, target);
};

const canTalk = (bot, channel) => {
	const permissions = channel.permissionsOf(bot.user.id);
	return (permissions.sendMessages || permissions.sendMessages == null);
};

const leftPad = (msg, targetLength, char = ' ') => {
	if (typeof char !== 'string' || char.length === '') return msg;
	while (msg.length < targetLength) msg = char + msg;
	return msg;
};

const indexBy = (arr, prop) => {
	return arr.reduce((map, obj) => {
		map[obj[prop]] = obj;
		return map;
	}, {});
};

const modList = (list, toAdd, toRemove) => {
	const map = new Map();
	list.forEach(item => map.set(item, true));
	toAdd.forEach(item => map.set(item, true));
	toRemove.forEach(item => map.delete(item));

	return Array.from(map.keys());
};

const prettyList = (list, lastSeparator = ' and ', separator = ', ') => {
	if (list.length > 1) {
		return list.slice(0, -1).join(separator) + lastSeparator + list[list.length - 1];
	} else if (list.length === 1) {
		return list[0];
	} else {
		return '';
	}
};

module.exports = {
	recursiveAssign,
	canTalk,
	leftPad,
	indexBy,
	modList,
	prettyList
};