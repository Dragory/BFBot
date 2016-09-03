const config = require('./config');
const Knex = require('knex');

const knex = Knex(config.db);

module.exports = knex;