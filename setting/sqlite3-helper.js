const DB = require('better-sqlite3-helper');

//The first call creates the global instance with your settings
DB({
	path: './db/poa_bot.db', // this is the default
	memory: false, // create a db only in memory
	readonly: false, // read only
	fileMustExist: false, // throw error if database not exists
	WAL: false, // automatically enable 'PRAGMA journal_mode = WAL'
	migrate: false
})

module.exports = {
	DB : DB
}