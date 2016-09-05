const settings = require('../settings');

module.exports = function(bot) {
	const setCmd = (msg, args) => {
		if (! msg.member) return;
		if (! msg.member.permission.has('administrator')) return;

		if (args.length < 2) return;

		let key = args[0];
		let value = args.slice(1).join(' ');

		if (value.trim() === '') {
			settings.reset(msg.channel.guild.id, key).then(() => {
				bot.createMessage(msg.channel.id, `Setting \`${key}\` reset`);
			});
		} else {
			settings.set(msg.channel.guild.id, key, value)
				.then(() => {
					bot.createMessage(msg.channel.id, `\`${key}\` is now \`${value}\``);
				}, e => {
					bot.createMessage(msg.channel.id, `**[ERROR]** ${e.message}`);
				});
		}
	};

	const getCmd = (msg, args) => {
		if (! msg.member) return;
		if (! msg.member.permission.has('administrator')) return;

		if (args.length < 1) return;

		let key = args[0];
		settings.get(msg.channel.guild.id, key)
			.then(value => {
				bot.createMessage(msg.channel.id, `\`${key}\` is \`${value}\``);
			}, e => {
				bot.createMessage(msg.channel.id, `**[ERROR]** ${e.message}`);
			});
	};

	const allCmd = (msg, args) => {
		if (! msg.member) return;
		if (! msg.member.permission.has('administrator')) return;

		settings.getAll(msg.channel.guild.id)
			.then(settings => {
				const text = Object.keys(settings).map(key => {
					const value = settings[key];
					return `\`${key}\` is \`${value}\``;
				}).join('\n');

				bot.createMessage(msg.channel.id, text);
			});
	};

	bot.registerCommand('settings', (msg, args) => {
		if (args[0] === 'set') return setCmd(msg, args.slice(1));
		if (args[0] === 'get') return getCmd(msg, args.slice(1));
		if (args[0] === 'all') return allCmd(msg, args.slice(1));
	});

	bot.registerCommand('sset', setCmd);
	bot.registerCommand('sget', getCmd);
	bot.registerCommand('sall', allCmd);
};