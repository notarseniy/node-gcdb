/**
 * GCDB
 *
 * @module		:: GCDB
 * @description :: Functions for work with GreenCubes databases
 */

var mysql = require('mysql');


var dbconn = {
	sitedb: null,
	usersdb: null,
	marinsrvdb: null,
	orgdb: null
};

module.exports = GCDB;

function GCDB(config) {
	if (!config.sitedb) {
		console.error("Wrong configuration: No site [gcdb] DB connection");
	}

	if (!config.usersdb) {
		console.error("Wrong configuration: No users [main] DB connection");
	}

	if (!config.mainsrvdb) {
		console.error("Wrong configuration: No main game server auth DB connection");
	}

	if (!config.orgdb) {
		console.error("Wrong configuration: No organization DB connection");
	}

	this.sitedb = dbconn.sitedb = (config.sitedb) ? mysql.createPool(config.sitedb) : null;
	this.usersdb = dbconn.usersdb = (config.usersdb) ? mysql.createPool(config.usersdb) : null;
	this.mainsrvdb = dbconn.mainsrvdb = (config.mainsrvdb) ? mysql.createPool(config.mainsrvdb) : null;
	this.orgdb = dbconn.orgdb = (config.orgdb) ? mysql.createPool(config.orgdb) : null;
};


GCDB.prototype.user = user = {
	getByID: function (id, db, cb) {

		var query;

		if (db instanceof Function) {
			cb = db;
			db = dbconn.sitedb;
			query = 'SELECT login FROM users WHERE id = ?';
		} else {
			switch (db) {
				case 'gcdb':
				case 'sitedb':
					query = 'SELECT login FROM users WHERE id = ?';
					db = dbconn.sitedb;
					break;

				case 'maindb':
				case 'usersdb':
					query = 'SELECT name AS login FROM users WHERE id = ?';
					db = dbconn.usersdb;
					break;

				default:
					return cb('Wrong DB');
			}
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');

		db.query(query, [id], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb(null, null);
			}
		});
	},

	getByLogin: function (login, db, cb) {

		var query;

		if (db instanceof Function) {
			cb = db;
			db = dbconn.sitedb;
			query = 'SELECT id FROM users WHERE login = ?';
		} else {
			switch (db) {
				case 'gcdb':
				case 'sitedb':
					query = 'SELECT id FROM users WHERE login = ?';
					db = dbconn.sitedb;
					break;

				case 'maindb':
				case 'usersdb':
					query = 'SELECT id FROM users WHERE name = ?';
					db = dbconn.usersdb;
					break;

				default:
					return cb('Wrong DB');
			}
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');


		db.query(query, [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].id);
			} else {
				cb(null, null);
			}
		});
	},

	getCapitalizedLogin: function getCapitalizedLogin(login, cb) {
		if (!dbconn.sitedb) return cb('You\'re not connected to GC MySQL DB');

		dbconn.sitedb.query('SELECT login, id FROM users WHERE login = ?', [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb(null, null);
			}
		});
	},

	getRegDate: function getRegDate(user, cb) {
		if (typeof user === 'number') {
			dbconn.sitedb.query('SELECT reg_date FROM users WHERE id = ?', [user], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result[0].reg_date);
				}
			});
		} else if (typeof user === 'string') {
			dbconn.sitedb.query('SELECT reg_date FROM users WHERE login = ?', [user], function (err, result) {
				if (err) return cb(err);

				cb(null, result[0].reg_date);
			});
		} else {
			cb('Incorrect variable!');
		}
	},


};

GCDB.prototype.org = org = {
	getByID: function getByID(id, cb) {
		if (!dbconn.sitedb) return cb('You\'re not connected to GC MySQL DB');

		dbconn.orgdb.query('SELECT * FROM organizations WHERE id = ?', [id], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0]);
			} else {
				cb(null, null);
			}
		});
	},

	getByTag: function getByTag(tag, cb) {
		if (!dbconn.sitedb) return cb('You\'re not connected to GC MySQL DB');

		dbconn.orgdb.query('SELECT * FROM organizations WHERE tag = ?', [tag], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0]);
			} else {
				cb(null, null);
			}
		});
	}
};
