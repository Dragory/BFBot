const db = require('../db');
const objection = require('objection');
const Model = objection.Model;

Model.knex(db);

module.exports = Model;
