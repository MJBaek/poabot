module.exports = function (args) {
	const CronJob = require('cron').CronJob
	require('dotenv').config()
	const QRY = require ('./db/query')(args)
	const dateUtil = require('./setting/date_util')()
	
	let module = {}
//	
//	let isGaming = ((coinName)=>{
//		let res = QRY.gameStatus(coinName)
//		
//		if(res.isError){
//			throw new Error(res.errMsg)
//		}
//		
//		return res
//	})
//
//	let gameOver = ((coinName, gameId)=>{
//		let coinPrice = CRAWLER.getPriceFromCoingecko(coinName)
//		let res = QRY.gameOver(coinName,coinPrice,gameId)
//		
//		if(res.isError){
//			throw new Error(res.errMsg)
//		}
//		
//		return res
//	})
//
//	let gameStart = ((coinName)=>{
//		let coinPrice = CRAWLER.getPriceFromCoingecko(coinName)
//		QRY.gameStart(coinName,coinPrice)
//	})
//
//	let gamePriceUpdate =((coinName)=>{
//		let coinPrice = CRAWLER.getPriceFromCoingecko(coinName)
//		QRY.gamePriceUpdate(coinName,coinPrice)
//	})
//
//	let gameOverTimeCheck = ((compareDate)=>{
//		let diffObj = dateUtil.dateDiff(dateUtil.now(),compareDate)
//		return diffObj.sec >= 0 ? true : false
//	})
	
	let checkBotParticipation = (()=>{
		//check bot participation
		let roomList = QRY.getRoomList()
		roomList.forEach(roomId=>{
			args.bot.telegram.getChatMember(roomId, process.env.BOT_ID).then(res=>{
				if(res.status === 'left'){//if kick bot : normal group return left
					args.logger.debug(`normal group update room : ${roomId}`)
					QRY.updateRoomParticipate(roomId,0)
				}else{
					//get title
					args.bot.telegram.getChat(roomId)
					.then(obj => {
						obj.title
		            })
		            .catch(function(err){
		            	args.error(err)
		            })
				}
			})
			.catch((err)=>{// super group return error
				if(err.code === 403){
					args.logger.debug(`super group update room : ${roomId}`)
					QRY.updateRoomParticipate(roomId,0)
				}else{
					args.error(err)
				}
			})
		})
	})
	
	//Repeat every 1 second 
	module.schedule1Sec = new CronJob('*/1 * * * * *', function() {
		let gameCoin = ['bitcoin']//setting game coin. multiple  : bitcoin, ethereum
		
		try{
//			args.logger.debug(`cron schedule1Sec`)
			gameCoin.forEach((coinName)=>{
				let gameStatus = isGaming(coinName)
				
				if(gameStatus.isPreGame){
					if(gameOverTimeCheck(gameStatus.endDate)){
						//game over and new game start
						gameOver(coinName, gameStatus.gameId)
						gameStart(coinName)
						
					}else{//game ongoing
						gamePriceUpdate(coinName)
					}
				}else{//only insert
					gameStart(coinName)
				}
			})
		}catch(err){
			args.error(err)
		}
	})
	
	//Repeat every 10 second 
	module.schedule10Sec = new CronJob('*/10 * * * * *', function() {
		try{
//			args.logger.debug(`cron schedule10Sec`)
			checkBotParticipation()
			//* 환불 조건 (수수료를 뗀 후 환불)
			//1. 만약 한쪽의 배당률이 1 이하가 되는 경우 (소수점 6자리)
			//2. 참가자 미달 - 참가가 최소 up,down 각 1명 미만인 경우
			//3. 가격 미변동
		}catch(err){
			args.error(err)
		}
	})
	
	return module
}