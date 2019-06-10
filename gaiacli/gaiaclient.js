module.exports = function (logger) {
	const os = require('os')
	const exec = require('child_process').exec
	const request = require('request')
	let fs = require('fs')
	require('dotenv').config()
	
	
	let module = {}	
	let osArch = os.arch()
	let osPlatform = os.platform()
	let gaiacliDir = `${__dirname}/gaiacli_${osPlatform}_${osArch}`;
	
	module.createSendTx = ((info) => {
		try{
			let obj = JSON.parse(fs.readFileSync(`${__dirname}/stdTx.json`, 'utf8'))
			
			for(let i=0; i< info.length; i++){
				obj.value.msg.push(
					{
						type : 'cosmos-sdk/MsgSend',
						value : {
							from_address 	: info[i].from_address,
							to_address 		: info[i].to_address,
							amount			: [
								{ 	
									denom : info[i].denom, 
									amount : info[i].amount
								}
							]
						},
					}
				)
				obj.value.memo = typeof info[i].memo === 'undefined' ? '' : info[i].memo
			}
					
			let json = JSON.stringify(obj)
			//write
			fs.writeFileSync(`${__dirname}/unsignedSendTx.json`, json, 'utf8')
			return true
		}catch(err){
			logger.error(err)
			return false
		}		
	})
	module.signSendTx = (() => {
		let jsonRes = {}
		let cmd = `echo "${process.env.BOT_COSMOS_KEYPASSWORD}" | ${gaiacliDir} tx sign ${__dirname}/unsignedSendTx.json --from="${process.env.BOT_COSMOS_KEYNAME}" --chain-id="${process.env.BOT_COSMOS_CHAIN_ID}" --node="${process.env.BOT_COSMOS_TCP_URL}" > ${__dirname}/signedSendTx.json`
		
		return new Promise(function (resolve, reject) {
			try{
				exec(cmd, (error, stdout, stderr) => {
					if (error) {
						//gaia error
						jsonRes.code = 500
						jsonRes.msg = error
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}else{
						jsonRes.code = 200
						jsonRes.msg = 'success'
						jsonRes.type = 'text'
						jsonRes.data = 'Y'
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}
				})	
			}catch(err){
				logger.error(err)
				reject(err)
			}
		})	
	})
	
	module.broadcastSendTx = (() => {//0.00005 atom == 100
		let jsonRes = {}
		//--gas=300000 --fees=42000uatom
		let cmd = `${gaiacliDir} tx broadcast ${__dirname}/signedSendTx.json --node="${process.env.BOT_COSMOS_TCP_URL}" --output=json --indent`
		
		if(process.env.BOT_COSMOS_CHAIN_ID != 'owdinet'){
			cmd += ` --fees=500uatom`
		}
		logger.debug(cmd)
		
		return new Promise(function (resolve, reject) {
			try{
				exec(cmd, (error, stdout, stderr) => {
					if (error) {
						//gaia error
						jsonRes.code = 500
						jsonRes.msg = error
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}else{
						jsonRes.code = 200
						jsonRes.msg = 'success'
						jsonRes.type = 'text'
						jsonRes.data = stdout
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}
				})	
			}catch(err){
				logger.error(err)
				reject(err)
			}
		})	
	})
	
	module.verifyAddr = ((addr) => {
		let jsonRes = {}
		let cmd = `${gaiacliDir} query account ${addr} --trust-node --node=${process.env.BOT_COSMOS_TCP_URL}`
		
		return new Promise(function (resolve, reject) {
			try{
				exec(cmd, (error, stdout, stderr) => {
					if (error) {
						//gaia error
						jsonRes.code = 500
						jsonRes.msg = error
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}else{
						jsonRes.code = 200
						jsonRes.msg = 'success'
						jsonRes.type = 'text'
						jsonRes.data = 'Y'
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}
				})
			}catch(err){
				logger.error(err)
				reject(err)
			}
		})	
	})
	
	//입금 확인
	module.seekDeposit = (from, denom, amount, memo)=>{
		let url = `${process.env.BOT_COSMOS_LCD_URL}/txs?recipient=${process.env.BOT_COSMOS_ADDRESS}&page=10000000000&limit=5`
		let jsonRes = {}
		
		return new Promise(function (resolve, reject) {
			request(url, function(err, res, data){  
				if (err) {
					//http error
					jsonRes.code = 500
					jsonRes.msg = 'request fail'
					jsonRes= JSON.stringify(jsonRes)
					resolve(jsonRes)
				}else{
					let json = JSON.parse(data)
					let arr = []
					
//					logger.debug(`memo : ${memo}`)
					for(let i=0; i<json.length; i++){
						let jsonMemo = json[i].tx.value.memo
							
						//메모가 같아야함. 
						if(jsonMemo === memo){
							if(json[i].tx.value.msg[0].type == 'cosmos-sdk/Send' || json[i].tx.value.msg[0].type == 'cosmos-sdk/MsgSend'){//send 일 때만
								if(json[i].tx.value.msg[0].value.from_address == from){//주소가 같아야함.
									if(json[i].tx.value.msg[0].value.amount[0].denom == denom){
										if(json[i].tx.value.msg[0].value.amount[0].amount == amount){
											arr.push(json[i])
										}
									}
								}
							}
						}
					}
					
					if(arr.length>0){
						jsonRes.code = 200
						jsonRes.msg = 'success'
						jsonRes.type = 'hashArr'
						jsonRes.data = arr	
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)					
					}else{
						//not found
						jsonRes.code = 404
						jsonRes.msg = 'not found'
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}
				}
			})
		})
	}

	return module
}	