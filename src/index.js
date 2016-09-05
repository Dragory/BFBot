// Dependencies
const Eris = require('eris');
const config = require('./config');

const selfModule = require('./modules/self');
const statusModule = require('./modules/status');

const settingsModule = require('./modules/settings');
const rolesModule = require('./modules/roles');
const miscModule = require('./modules/misc');

// Initialize bot
const bot = new Eris.CommandClient(config.token, {}, {
	prefix: "!",
	ignoreBots: true,
	ignoreSelf: true,
	defaultHelpCommand: false
});

bot.on('ready', () => {
	console.log('Initialized and ready!');
});

// Initialize modules
selfModule(bot);
statusModule(bot);

settingsModule(bot);
rolesModule(bot);
miscModule(bot);

// Start the bot
bot.connect();
