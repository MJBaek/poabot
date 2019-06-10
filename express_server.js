const http = require('http'), https = require('https'), express = require('express'), fs = require('fs'), bodyParser = require('body-parser'), morgan = require('morgan'), mime = require('mime')
const cipher = require('./cipher')

const options = {
	key : fs.readFileSync(`${__dirname}/ssl/cosmos_codes_lcd_server.key`),
	cert : fs.readFileSync(`${__dirname}/ssl/cosmos_codes_bundle.crt`)
}	


const port1 = 8080
const port2 = 443

const serverStart = ((DB,logger,bot) =>{
	const app = express()

	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(morgan('combined'))


	https.createServer(options, app).listen(port2, function() {
		logger.debug("Express server https listening on port " + port2)
	})

//	http.createServer(app).listen(port1, function() {
//		logger.debug("Express server http listening on port " + port1)
//	})
		
	//입금처리 테스트
	app.get('/sign', function(req, res) {
		res.writeHead(404, {'Content-Type' : 'application/json'})
		res.write(`undefinded!`)
		res.end()
	})
})



module.exports = {
	serverStart : serverStart
}