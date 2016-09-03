exports.up = function(knex) {
	return knex.schema.createTable('assignable_role_channels', table => {
		table.increments('id');
		table.string('guild_id', 64);
		table.string('channel_id', 64);

		table.unique(['guild_id', 'channel_id']);
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('assignable_role_channels');
};
