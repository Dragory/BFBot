module.exports = function(bot) {
	bot.registerCommand('reddit', `
		Battlefield 1: https://www.reddit.com/r/battlefield_one
		Battlefield 3: https://www.reddit.com/r/battlefield3
		Battlefield 4: https://www.reddit.com/r/battlefield_4
		Hardline: https://www.reddit.com/r/BF_Hardline
	`.trim().split('\n').map(v => v.trim()).join('\n'));
};
