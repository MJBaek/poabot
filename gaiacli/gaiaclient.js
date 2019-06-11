module.exports = function (logger) {
	const os = require('os')
	const exec = require('child_process').exec
	const request = require('request')
	let fs = require('fs')
	
	
	let module = {}	
	let osArch = os.arch()
	let osPlatform = os.platform()
	let gaiacliDir = `${__dirname}/gaiacli_${osPlatform}_${osArch}`;
	
	module.accountCheck = ((addr) => {
		let cmd = `${gaiacliDir} q account ${addr} --trust-node --node=lcd.owdin.network:26657 --output=json --indent`
		let jsonRes = {}
		return new Promise(function (resolve, reject) {
			try{
				exec(cmd, (error, stdout, stderr) => {
					if (error) {
						logger.error(`=============accountCheck error===========`)
						logger.error(error)
						//gaia error
						jsonRes.code = 500
						jsonRes.msg = error
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}else{
						let json = JSON.parse(stdout)
						
						logger.debug(json)
						
						jsonRes.code = 200
						jsonRes.msg = 'success'
						jsonRes.amount = json.value.coins[0].amount
						jsonRes.denom = json.value.coins[0].denom
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
	module.stakingCheck = ((addr)=>{
		let cmd = `${gaiacliDir} q staking delegations ${addr} --trust-node --node=lcd.owdin.network:26657 --output=json --indent`
		let jsonRes = {}
		return new Promise(function (resolve, reject) {
			try{
				exec(cmd, (error, stdout, stderr) => {
					if (error) {
						logger.error(`=============stakingCheck error===========`)
						logger.error(error)
						//gaia error
						jsonRes.code = 500
						jsonRes.msg = error
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}else{
						let json = JSON.parse(stdout)
						let amount = 0
						logger.debug(json)
						for(let i=0; i<json.length; i++){
							amount += parseFloat(json[i].shares)
						}
						jsonRes.code = 200
						jsonRes.msg = 'success'
						jsonRes.amount = parseInt(amount)
						jsonRes.denom = 'uatom'
						jsonRes = JSON.stringify(jsonRes)
						resolve(jsonRes)
					}
				})	
			}catch(err){
				logger.error(err)
				reject(err)
			}
		})
	})
	module.verify = ((info) => {
		let cmd = `${gaiacliDir} poo verify ${info.sig} ${info.msg} ${info.pubKey} ${info.address}`
		let jsonRes = {}	
//		logger.debug(info.sig)
//		logger.debug(info.msg)
//		logger.debug(info.pubKey)
//		logger.debug(info.address)
		return new Promise(function (resolve, reject) {
			try{
				exec(cmd, (error, stdout, stderr) => {
					if (error) {
						logger.error(`=============verify error===========`)
						logger.error(error)
						//gaia error
						jsonRes.code = 500
						jsonRes.msg = error
						jsonRes= JSON.stringify(jsonRes)
						resolve(jsonRes)
					}else{
						logger.debug(stdout)
						if(stdout === 'Verified\n'){
							jsonRes.code = 200
							jsonRes.msg = 'success'
							jsonRes.type = 'text'
							jsonRes.data = stdout
							jsonRes= JSON.stringify(jsonRes)
						}else{
							jsonRes.code = 501
							jsonRes.msg = 'fail'
							jsonRes.type = 'text'
							jsonRes.data = stdout
							jsonRes= JSON.stringify(jsonRes)
						}
						resolve(jsonRes)
					}
				})	
			}catch(err){
				logger.error(err)
				reject(err)
			}
		})
	})

	return module
}	