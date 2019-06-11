const http = require('http'), https = require('https'), express = require('express'), fs = require('fs'), bodyParser = require('body-parser'), morgan = require('morgan'), mime = require('mime')
const cipher = require('./cipher')
const bigInt = require('big-integer')
const options = {
	key : fs.readFileSync(`${__dirname}/ssl/cosmos_codes_lcd_server.key`),
	cert : fs.readFileSync(`${__dirname}/ssl/cosmos_codes_bundle.crt`)
}	
//<--bot
const Telegraf = require('telegraf')
const botId = 826811748
const botToken = '826811748:AAE9j_9xyuRApCJovJuDOkj3f0o03Gz2wQo'
const botName = '@poa_pro_bot'	
const bot = new Telegraf(botToken, {username : botName})
//-->

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
			
			logger.debug(`==========================================================`)
			logger.debug(`1. jsonBody`)
			logger.debug(jsonBody)
			
			let row = DB().queryFirstRow('SELECT msg FROM secret WHERE user_id=?', userTelegramId)
			
			logger.debug(`2. secret row`)
			logger.debug(row)
			
			if(typeof row !== 'undefined'){
				let info = {
						"msg"			: row.msg,
						"address" 		: jsonBody.encoded_address,
						"sig" 			: jsonBody.encoded_signature,
						"pubKey" 		: jsonBody.encoded_pub_key		
				}
				logger.debug(`3. info`)
				logger.debug(info)
				
				gaiacli.verify(info).then((res0) =>{
					logger.debug(`4. gaiacli verify result : ${res0}`)
					let json0 = JSON.parse(res0)
					
					logger.debug(parseInt(json0.code) === 200)
					//검증 성공
					if(parseInt(json0.code) === 200){
						//해당 계좌의 수량을 가져온다.
						gaiacli.accountCheck(jsonBody.address).then((res1)=>{
							let json1 = JSON.parse(res1)
							let coinAmount = bigInt(json1.amount)
							let coinDenom = json1.denom
							logger.debug(`5. gaiacli accountCheck`)
							logger.debug(json1)
							
							gaiacli.stakingCheck(jsonBody.address).then((res2)=>{
								let json2 = JSON.parse(res2)
								coinAmount += bigInt(json2.amount)
								logger.debug(`6. gaiacli stakingCheck`)
								logger.debug(json2)
								
								//db에 해당 유저의 정보를 업데이트 또는 인서트
								let row = DB().queryFirstRow('SELECT count(1) as cnt FROM user WHERE id=?', userTelegramId)
								if(row.cnt >0){
									DB().update('user', {address : jsonBody.address , denom : "uatom" , amount : coinAmount}, {id : userTelegramId})
								}else{
									DB().insert('user',{id : userTelegramId , address : jsonBody.address , denom : "uatom" , amount : coinAmount})
								}
								
								bot.telegram.editMessageText(jsonBody.edit_chat_id, jsonBody.edit_chat_message_id, jsonBody.edit_chat_message_id, `Regist success! Your account is ${coinAmount}uatom`)
								.catch(err =>{
									logger.error(`[EER0001] /regist - callback : 검증은 성공했지만, 메세지 수정에 실패했습니다.\n${err}`)
								})
							})
						})
					}
					res.writeHead(json0.code, {'Content-Type' : 'application/json'})
					res.write(`{ "responseMsg" : "${json0.msg}" }`)
					res.end()
				})
			}else{
				res.writeHead(404, {'Content-Type' : 'application/json'})
				res.write(resultJson)
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