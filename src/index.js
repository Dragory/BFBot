// Dependencies
const Eris = require('eris');
const config = require('./config');

const selfModule = require('./modules/self');
const statusModule = require('./modules/status');

const settingsModule = require('./modules/settings');
const rolesModule = require('./modules/roles');
const miscModule = require('./modules/misc');
const greetingModule = require('./modules/greeting');
const welcomeModule = require('./modules/welcome');
const spamModule = require('./modules/spam');

// Initialize bot
const bot = new Eris.CommandClient(config.token, {}, {
	prefix: "!",
	ignoreBots: true,
	ignoreSelf: true,
	defaultHelpCommand: false,
  defaultCommandOptions: {
    guildOnly: true,
    requirements: {
      permissions: {
        'kickMembers': true,
      },
    },
  },
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
greetingModule(bot);
welcomeModule(bot);
// spamModule(bot);

// Start the bot
bot.connect();
