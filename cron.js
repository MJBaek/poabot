module.exports = function (logger) {
	const CronJob = require('cron').CronJob
	require('dotenv').config()
//	const QRY = require ('./db/query')(args)
//	const dateUtil = require('./setting/date_util')()
//	
	let module = {}
//	
//	let checkBotParticipation = (()=>{
//		//check bot participation
//		let roomList = QRY.getRoomList()
//		roomList.forEach(roomId=>{
//			args.bot.telegram.getChatMember(roomId, process.env.BOT_ID).then(res=>{
//				if(res.status === 'left'){//if kick bot : normal group return left
//					args.logger.debug(`normal group update room : ${roomId}`)
//					QRY.updateRoomParticipate(roomId,0)
//				}else{
//					//get title
//					args.bot.telegram.getChat(roomId)
//					.then(obj => {
//						obj.title
//		            })
//		            .catch(function(err){
//		            	args.error(err)
//		            })
//				}
//			})
//			.catch((err)=>{// super group return error
//				if(err.code === 403){
//					args.logger.debug(`super group update room : ${roomId}`)
//					QRY.updateRoomParticipate(roomId,0)
//				}else{
//					args.error(err)
//				}
//			})
//		})
//	})
	
	//Repeat every 10 second 
	module.schedule10Sec = new CronJob('*/10 * * * * *', function() {
		
		try{
			//checkBotParticipation()
			console.log('10sec')
		}catch(err){
			logger.error(err)
		}
	})
	
	//Repeat every 10 minute 
	module.schedule10Min = new CronJob('* */10 * * * *', function() {
		try{
			/*
			 let sql = `
				SELECT *
				FROM room
				WHERE announce = 1 AND participation = 1
			`
			let rows = args.DB().query(sql)
			let list = []
			rows.forEach(row => {
				list.push(row.id)
			})
			 */
			console.log('10min')
		}catch(err){
			logger.error(err)
		}
	})
	
	return module
}