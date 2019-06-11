'use strict'
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const {log4js} = require('./setting/log4js')
const DB = require('./setting/sqlite3-helper').DB
const expressServer = require('./express_server')
//const cronJob = require('./cron')

const logger = log4js

const botId = 826811748
const botToken = '826811748:AAE9j_9xyuRApCJovJuDOkj3f0o03Gz2wQo'
const botName = '@poa_pro_bot'	
	
const bot = new Telegraf(botToken, {username : botName})
bot.use(session())
bot.startPolling()
expressServer.serverStart(DB,logger,bot)

bot.on('message', (ctx) => {
	//새로운 사람이 입장
	if(typeof ctx.update.message.new_chat_members !== 'undefined'){
		try{
			let chatId = ctx.chat.id
			let userId = ctx.update.message.new_chat_member.id
			let roomRow = DB().queryFirstRow('SELECT limit_denom, limit_amount FROM room WHERE id=?', chatId)
			
			logger.debug(`====================${chatId} new_chat_members : ${userId}=================`)
			//방에 제한이 걸려 있는 경우에만 실시
			if(typeof roomRow !== 'undefined'){
				let userRow = DB().queryFirstRow('SELECT denom, amount FROM user WHERE id=?', userId)
				
				if(typeof userRow !== 'undefined'){
					if(userRow.denom == roomRow.limit_denom){
						if(userRow.amount >= roomRow.limit_amount){
							ctx.reply(`welcome!`)
						}else{
							ctx.telegram.kickChatMember(chatId,userId)
							//봇이 먼저 대화를 걸수가 없으므로 아래 메세지는 봇과 대화를 시작한적이 없는 경우 생략됨.
							ctx.telegram.sendMessage(userId,`Sorry. This is a vip room. You have to prove quantity over ${room.limit_amount}${room.limit_denom}. To verify your account, you can use the /regist command to @poa_pro_bot.`)
						}
					}else{
						ctx.telegram.kickChatMember(chatId,userId)
						ctx.telegram.sendMessage(userId,`Sorry. This is a vip room. You have to prove quantity over ${room.limit_amount}${room.limit_denom}. To verify your account, you can use the /regist command to @poa_pro_bot.`)
					}
				}else{
					ctx.telegram.kickChatMember(chatId,userId)
					ctx.telegram.sendMessage(userId,`Sorry. This is a vip room. You have to prove quantity over ${room.limit_amount}${room.limit_denom}. To verify your account, you can use the /regist command to @poa_pro_bot.`)
				}
			}
		}catch(err){
			logger.debug(`kick error! ${err}`)
		}
	}
	
	
	//@adv_pro_bot 호출 시 동일한 명령어로 인식 하도록
	ctx.update.message.text = typeof ctx.update.message.text !== 'undefined' ? ctx.update.message.text.replace(botName,"") : ""
	
//	if(typeof ctx.update.message.text !== 'undefined'){
//		logger.debug(`====================================user input text -> ${ctx.update.message.text}====================================`)
//	}	
	
    let txt = ctx.update.message.text.substring(1) 
    let txtArr = txt.split(' ')
    
    ctx.state.cmd = txtArr[0]    //ex) [command] 
    ctx.state.cmdOpt = txtArr[1]    //ex) command [opt]
    ctx.state.commandType = txtArr.length > 1 ? 'm' : 's' //command type ( M : multi , S : single)
    ctx.state.chatType = ctx.chat.type === 'private' ? 'p' : 'g'  //chat type - p : private else g : group
    ctx.state.telegramId = ctx.state.chatType === 'p' ?  ctx.chat.id : ctx.update.message.from.id   //telegram id - user's telegramid
    ctx.state.menuMsgId = ctx.message.message_id
    
    
    if(ctx.update.message.text.startsWith('/')){ // only cmd
    	switch(ctx.state.cmd){
    		//채팅방 등록
    		case 'room_regist':
    			if(ctx.state.chatType === 'p'){
    				ctx.reply(`To use the poa bot, you need to do the following:\n* Bot is available for GROUP , SUPER GROUPS.\n1. Invite @poa_pro_bot to the group chat.\n2. In the group chat, send the following command: /room_regist`)
    			}else{
    				checkAdmin(ctx).then((res)=>{
    					if(res){
    						isAdminBot(ctx).then((res2)=>{
    	    					if(res2){
    	    						ctx.reply(`Please input denom`)
    	    						ctx.session.command = 'room_regist2'
    	    					}else{
    	    						ctx.reply(`Give bot admin privileges.`)
    	    					}
    	    				})
    					}else{
    						ctx.reply(`You are not admin`)
    					}
    				})
    			}
    			
    			break
    		//계좌 등록	
    		case 'regist' :
    			const cipher = require('./cipher')
    			let msg = cipher.randomStr(20)
    			let json = {
						"action" : "sign",
						"requester_t_id" : botId, // int poaBotTelegramId
						"tx" : {
							"denom": "stasia",
							"memo" : msg //사인 해야할 텍스트
						 
						 },
						 "callback": {
						 	"url": "https://cosmos.codes/",
					  		"endpoint": "sign",
					  		"custom_fields": {
					  			"edit_chat_id" : ctx.chat.id,
								"edit_chat_message_id": ""
							}
					  	}
				}
    			try{
    				let row = DB().queryFirstRow('SELECT count(1) as cnt FROM secret WHERE user_id=?', ctx.state.telegramId)
    				if(row.cnt >0){
    					DB().update('secret', {msg : msg}, {user_id : ctx.state.telegramId})
    				}else{
    					DB().insert('secret',{user_id : ctx.state.telegramId, msg : msg})
    				}
    				
    				bot.telegram.sendMessage(ctx.chat.id, 'wait..').then((m) => {
						json.callback.custom_fields.edit_chat_message_id = m.message_id
						let enc = cipher.encrypt(JSON.stringify(json))
						let encMsg = `lmi::2::${enc}`
						logger.debug(encMsg)
						bot.telegram.editMessageText(ctx.chat.id, m.message_id, m.message_id, encMsg)
    				})
    			}catch(err){
    				ctx.reply(`Sorry! We got error.`)
    				logger.error(err)
    			}
    			break
    		//unknown	
    		default :
    			ctx.reply(`Unknown command`)
    			break
    	}
	}else{
		//텍스트가 들어 왔지만, 세션에 명령이 남아 있는 경우
        if(typeof ctx.session.command !== 'undefined'){
        	switch(ctx.session.command){
        	
        		//채팅방 등록2 - 제한할 코인 종류 입력
        		case 'room_regist2':
        			ctx.session.limitDenom = ctx.update.message.text
        			ctx.reply(`Please enter the minimum number of ${ctx.session.denom} coin entries.`)
        			ctx.session.command = 'room_regist3'
        			break
        			
        		//채팅방 등록3 - 제한할 코인 개수 입력 
        		case 'room_regist3':
        			if(typeof ctx.session.limitDenom !== 'undefined'){
        				ctx.session.limitAmount = ctx.update.message.text
        				try{
        					DB().prepare(`INSERT INTO room (id,limit_denom,limit_amount) values('${ctx.chat.id}','${ctx.session.limitDenom}','${ctx.session.limitAmount}')`).run()
							ctx.reply(`Congratulation! This room regist success! Limited ${ctx.session.limitAmount} ${ctx.session.limitDenom}`)
        				}catch(err){
        					if(err == 'SqliteError: UNIQUE constraint failed: room.id'){
        						ctx.reply(`Your room is already regist`)	
        					}else{
        						ctx.reply(`Sorry! ${err}`)	
        					}
        				}finally{
        					ctx.session.command = undefined
        					ctx.session.limitDenom  = undefined
        					ctx.session.limitAmount = undefined
        				}
        			}
        			break
        	}
        }
	}
    
    logger.debug(ctx.state)
})

//콜백(버튼을 누를때)
bot.on('callback_query', (ctx) => {
	
})

const isAdminBot = function(ctx){
	return new Promise(function (resolve, reject) {
		let isAdmin = false
		ctx.telegram.getChatMember(ctx.chat.id, botId).then(obj => {
			isAdmin = obj.status !== 'administrator' ? false : true
        	resolve(isAdmin)
		})
	})
}
const checkAdmin = function (ctx){
	return new Promise(function (resolve, reject) {
		let isAdmin = false
		ctx.telegram.getChatAdministrators(ctx.chat.id).then(obj => {
        	for(let i=0; i<obj.length; i++){
        		if(obj[i].user.id === ctx.update.message.from.id){
        			isAdmin = true
        			break
        		}
        	}
        	resolve(isAdmin)
		})
	})
}

