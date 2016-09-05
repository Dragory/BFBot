const DEFAULT_CDTIME = 1000 * 10; // 10 seconds
const cooldowns = {};

const trigger = (guildId, cmdId, cdTime = DEFAULT_CDTIME) => {
	if (! cooldowns[guildId]) cooldowns[guildId] = {};
	if (! cooldowns[guildId][cmdId]) cooldowns[guildId][cmdId] = 0;

	const now = Date.now();
	if (cooldowns[guildId][cmdId] > now) return false;

	cooldowns[guildId][cmdId] = now + cdTime;
	return true;
};

module.exports = {trigger};