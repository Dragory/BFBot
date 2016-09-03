exports.up = function(knex) {
	return knex.schema.createTable('settings', table => {
		table.string('guild_id', 64);
		table.string('key', 128);
		table.text('value');

		table.primary(['guild_id', 'key']);
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('settings');
};
