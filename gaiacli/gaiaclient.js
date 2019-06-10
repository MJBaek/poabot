module.exports = function (logger) {
	const os = require('os')
	const exec = require('child_process').exec
	const request = require('request')
	let fs = require('fs')
	
	
	let module = {}	
	let osArch = os.arch()
	let osPlatform = os.platform()
	let gaiacliDir = `${__dirname}/gaiacli_${osPlatform}_${osArch}`;
	
	
	module.verify = ((info) => {
		let cmd = `${gaiacliDir} poo verify ${info.sig} ${info.msg} ${info.pubKey} ${info.address}`
		logger.debug(info.sig)
		logger.debug(info.msg)
		logger.debug(info.pubKey)
		logger.debug(info.address)
		return new Promise(function (resolve, reject) {
			try{
				exec(cmd, (error, stdout, stderr) => {
					if (error) {
						logger.debug(error)
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

	return module
}	