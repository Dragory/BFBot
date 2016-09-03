const util = require('../util');
const settings = require('../settings');
const AssignableRole = require('../models/AssignableRole');
const AssignableRoleChannel = require('../models/AssignableRoleChannel');

const normalizeRoleName = name => name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const findRoleByName = (guild, name) => {
	const normalizedSearchName = normalizeRoleName(name);

	return guild.roles.find(role => {
		const normalizedRoleName = normalizeRoleName(role.name);
		return (normalizedSearchName === normalizedRoleName);
	});
};

const findRolesByName = (guild, list) => {
	return list
		.map(roleName => findRoleByName(guild, roleName))
		.filter(role => role !== null);
};

// Mod = +THING, -THING
const getModsFromText = str => {
	const mods = {
		add: [],
		remove: []
	};

	const matcher = /(?:^|\s)([+-])([a-z0-9]+)\b/gi;
	let match;

	while ((match = matcher.exec(str)) !== null) {
		if (match[1] === '+') mods.add.push(match[2]);
		else mods.remove.push(match[2]);
	}

	return mods;
};

let assignableRoleChannels = {}; // Cached

const getChannels = (guild) => {
	if (assignableRoleChannels[guild]) {
		return Promise.resolve(assignableRoleChannels[guild]);
	} else {
		return AssignableRoleChannel.query()
			.where('guild_id', guild.id)
			.then(channels => channels.map(channel => channel.channel_id))
			.then(channels => {
				assignableRoleChannels[guild] = channels;
				return channels;
			});
	}
};

module.exports = function(bot) {
	// Remove other messages on the role channels (typos, etc.) (controlled by roles.autoDeleteOtherMessages)
	function deleteOtherMessage(msg) {
		getChannels(msg.channel.guild).then(channels => {
			if (channels.indexOf(msg.channel.id) === -1) return;

			settings.get(msg.channel.guild.id, 'roles.autoDeleteOtherMessages').then(value => {
				if (! value) return;
				bot.deleteMessage(msg.channel.id, msg.id);
			});
		});
	}

	// Allow adding/removing assignable roles by saying +ROLE or -ROLE respectively
	bot.on('messageCreate', msg => {
		if (! msg.member) return;
		if (msg.author.bot) return;
		if (msg.content === '!roles') return;
		if (msg.content[0] === '!') return deleteOtherMessage(msg);

		const guild = msg.channel.guild;
		getChannels(guild).then(channels => {
			if (channels.indexOf(msg.channel.id) === -1) return;

			const roleMods = getModsFromText(msg.content);
			let toAdd = findRolesByName(guild, roleMods.add).map(role => role.id);
			let toRemove = findRolesByName(guild, roleMods.remove).map(role => role.id);

			if (toAdd.length === 0 && toRemove.length === 0) return deleteOtherMessage(msg);

			AssignableRole.query()
				.where('guild_id', guild.id)
				.then(result => {
					const assignableRolesByRoleId = util.indexBy(result, 'role_id');

					// Restrict the to-be-added-or-removed roles to the assignable roles for this server
					toAdd = toAdd.filter(roleId => !! assignableRolesByRoleId[roleId]);
					toRemove = toRemove.filter(roleId => !! assignableRolesByRoleId[roleId]);

					const newRoles = util.modList(msg.member.roles, toAdd, toRemove);

					// Save the new roles
					bot.editGuildMember(guild.id, msg.author.id, {roles: newRoles}).then(() => {
						const addedRoleNames = toAdd.map(roleId => guild.roles.get(roleId).name).map(name => `**${name}**`);
						const removedRoleNames = toRemove.map(roleId => guild.roles.get(roleId).name).map(name => `**${name}**`);

						const addedStr = (addedRoleNames.length === 1 ? 'role' : 'roles');
						const removedStr = (removedRoleNames.length === 1 ? 'role' : 'roles');

						let msgParts = [];
						if (addedRoleNames.length > 0) msgParts.push(`now have the ${addedStr} ${util.prettyList(addedRoleNames)}`);
						if (removedRoleNames.length > 0) msgParts.push(`no longer have the ${removedStr} ${util.prettyList(removedRoleNames)}`);

						return bot.createMessage(msg.channel.id, `${msg.author.mention} You ${msgParts.join(' and ')}`);
					}, (e) => {console.error(e);})
					.then(doneMsg => {
						settings.getMultiple(guild.id, ['roles.autoDeleteMessages', 'roles.autoDeleteOtherMessages', 'roles.autoDeleteDelay']).then(values => {
							if (! values['roles.autoDeleteMessages']) return;

							const deleteDelay = parseInt(values['roles.autoDeleteDelay'], 10) * 1000;
							setTimeout(() => {
								bot.deleteMessage(msg.channel.id, msg.id);
								bot.deleteMessage(msg.channel.id, doneMsg.id);
							}, deleteDelay);
						});
					});
				});
		});
	});

	// Assignable roles
	bot.registerCommand('roles', (msg, args) => {
		if (! msg.member) return;

		const guild = msg.channel.guild;

		if (args.length === 0) {
			getChannels(guild).then(channels => {
				if (channels.indexOf(msg.channel.id) === -1) return;

				// Get assignable roles
				AssignableRole.query()
					.where('guild_id', guild.id)
					.then(assignableRoles => {
						const assignableRoleNames = assignableRoles.map(assignableRole => {
							const role = guild.roles.get(assignableRole.role_id);
							return (role ? `**${role.name}**` : `[UNKNOWN ROLE ${assignableRole.role_id}]`);
						});

						bot.createMessage(msg.channel.id, `The following roles are available: ${util.prettyList(assignableRoleNames)}`)
							.then(listMsg => {
								settings.getMultiple(guild.id, ['roles.autoDeleteMessages', 'roles.autoDeleteListDelay']).then(values => {
									if (! values['roles.autoDeleteMessages']) return;

									const deleteDelay = parseInt(values['roles.autoDeleteListDelay'], 10) * 1000;
									setTimeout(() => {
										bot.deleteMessage(msg.channel.id, msg.id);
										bot.deleteMessage(msg.channel.id, listMsg.id);
									}, deleteDelay);
								});
							});
					});
			});
		} else {
			// (ADMIN) Set assignable roles
			if (! msg.member.permission.has('administrator')) return;

			const roleMods = getModsFromText(args.join(' '));
			let toAdd = findRolesByName(guild, roleMods.add).map(role => role.id);
			let toRemove = findRolesByName(guild, roleMods.remove).map(role => role.id);

			if (toAdd.length === 0 && toRemove.length === 0) return;

			AssignableRole.query()
				.where('guild_id', guild.id)
				.then(assignableRoles => {
					const assignableRolesByRoleId = util.indexBy(assignableRoles, 'role_id');

					// Remove duplicate roles
					toAdd = toAdd.filter(roleId => ! assignableRolesByRoleId[roleId]);

					// Cleanup: add non-existing assignable roles to the toRemove list
					toRemove = assignableRoles.reduce((toRemove, assignableRole) => {
						if (guild.roles.get(assignableRole.role_id) === null) {
							toRemove.push(assignableRole.role_id);
						}

						return toRemove;
					}, toRemove);

					toAdd = util.unique(toAdd);
					toRemove = util.unique(toRemove);

					const promises = [];

					if (toAdd.length > 0) {
						toAdd.forEach(roleId => {
							let q = AssignableRole.query()
								.insert({
									guild_id: guild.id,
									role_id: roleId
								});

							promises.push(q);
						});
					}

					if (toRemove.length > 0) {
						let q = AssignableRole.query()
							.where('guild_id', guild.id)
							.whereIn('role_id', toRemove)
							.delete();

						promises.push(q);
					}

					Promise.all(promises)
						.then(() => {
							return AssignableRole.query().where('guild_id', guild.id);
						})
						.then(result => {
							const assignableRoleNames = result.map(assignableRole => {
								const role = guild.roles.get(assignableRole.role_id);
								return (role ? role.name : `[UNKNOWN ROLE ${assignableRole.role_id}]`);
							});

							bot.createMessage(msg.channel.id, `Roles updated! Assignable roles are now: ${util.prettyList(assignableRoleNames)}`);
						});
				});
		}
	});

	// (ADMIN) Set channels where roles can be assigned
	bot.registerCommand('role_channels', msg => {
		if (! msg.member) return;
		if (! msg.member.permission.has('administrator')) return;

		const guild = msg.channel.guild;

		const channels = msg.channelMentions;
		if (channels.length === 0) return;

		const del = AssignableRoleChannel.query()
			.where('guild_id', guild.id)
			.delete()
			.execute();

		del.then(() => {
				const promises = [];
				channels.forEach(channel => {
					const q = AssignableRoleChannel.query()
						.insert({guild_id: guild.id, channel_id: channel});

					promises.push(q);
				});

				return Promise.all(promises);
			})
			.then(() => {
				assignableRoleChannels[guild] = null; // Reset channel cache
				getChannels(guild).then(channels => {
					const channelNames = channels.map(channel => guild.channels.get(channel).mention);
					bot.createMessage(msg.channel.id, `Channels updated! Channels are now: ${util.prettyList(channelNames)}`);
				});
			}, (e) => {
				console.error(e);
			});
	});
};