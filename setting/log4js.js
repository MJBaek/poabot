const log4js = require('log4js')

//logger
log4js.configure({
    appenders: { 
    	poa_bot: { 
			type: 'dateFile', 
			filename: './poa_bot.log',
		    compress: true
    	} 
    },
    categories: { 
    	default: { 
    		appenders: ['poa_bot'], 
    		level: 'debug' 
    	} 
    }
})

const logger = log4js.getLogger('poa_bot')

// console.log(logger)
module.exports = {
   log4js : logger
}