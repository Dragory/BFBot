const settings = require('../settings');

module.exports = function(bot) {
	bot.on('guildMemberAdd', (guild, member) => {
		settings.get(guild.id, 'greeting').then(greeting => {
			if (greeting == null) return;

			greeting = greeting.replace(/{name}/g, member.nick || member.user.username);

			bot.getDMChannel(member.user.id).then(channel => {
				if (! channel) return;

				bot.createMessage(channel.id, greeting);
			});
		});
	});

	bot.registerCommand('greeting', (msg, args) => {
		if (! msg.member) return;
		if (! msg.member.permission.has('administrator')) return;

		const greeting = args.join(' ');
		if (greeting === '') {
			settings.get(msg.channel.guild.id, 'greeting').then(greeting => {
				bot.createMessage(msg.channel.id, 'Current greeting is:\n```' + greeting + '```');
			});
		} else {
			if (greeting === 'remove') {
				settings.set(msg.channel.guild.id, 'greeting', null).then(() => {
					bot.createMessage(msg.channel.id, 'Greeting removed');
				});
			} else {
				settings.set(msg.channel.guild.id, 'greeting', greeting).then(() => {
					bot.createMessage(msg.channel.id, 'Greeting updated!');
				});
			}
		}
	});
};
