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
	/*
	{
	 "lmi_version": 2,
	 "t_user_id": "123123123",
	 "address": "cosmos1nysrwemv26mzz4q7e787qjcjeprka440wrdrys",
	 "encoded_signature": "36079c87f6e8b2a1e5209d74e1e64fe7ad01734f7f1e7aebe16b4c6631fba8ee0210198d1a17c1bef09a3fb8894bdadeda88dbfe85ede6bb342103af2c5881bf",
	 "encoded_address": "992037676c56b621541ecf8fe04b12c8476ed6af",
	 "encoded_pub_key": "woeijwoeijowrij",
	 "custom_field1": "It’ s custom field1",
	 "custom_field2": "It’ s custom field2"
	}
	
	t_user_id : 텔레그램 사용자 아이디
	address : 코스모스 어드레스
	encoded_signature : 서명 (encoded)
	encoded_address : 서명자 어드레스 (encoded)
	encoded_pub_key : 서명자 퍼블릭키 (encoded)
	*/
		
	//입금처리 테스트
	app.post('/sign', function(req, res) {
		try{
			const gaiacli = require('./gaiacli/gaiaclient')(logger)
			let jsonBody = req.body
			let lmiVersion = jsonBody.lmi_version
			let userTelegramId = jsonBody.t_user_id
			
			let row = DB().queryFirstRow('SELECT msg FROM secre WHERE user_id=?', userTelegramId)
			
			
			if(typeof row !== 'undefined'){
				let info = {
						"msg"			: row.msg,
						"address" 		: jsonBody.address,
						"sig" 			: jsonBody.encoded_signature,
						"pubKey" 		: jsonBody.encoded_pub_key		
				}
				gaiacli.verify(info)
			}else{
				res.writeHead(404, {'Content-Type' : 'application/json'})
				res.write(`undefinded!`)
				res.end()
			}
		}catch(err){
			logger.error(err)
		}
		
	})
})



module.exports = {
	serverStart : serverStart
}