exports.up = function(knex) {
	return knex.schema.createTable('assignable_roles', table => {
		table.increments('id');
		table.string('guild_id', 64);
		table.string('role_id', 64);

		table.unique(['guild_id', 'role_id']);
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('assignable_roles');
};
