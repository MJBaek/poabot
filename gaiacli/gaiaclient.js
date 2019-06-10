module.exports = function (logger) {
	const os = require('os')
	const exec = require('child_process').exec
	const request = require('request')
	let fs = require('fs')
	
	
	let module = {}	
	let osArch = os.arch()
	let osPlatform = os.platform()
	let gaiacliDir = `${__dirname}/gaiacli_${osPlatform}_${osArch}`;
	
	
	module.verification = ((info) => {
		let cmd = `${gaiacliDir} gaiacli poo verify ${info.sig} [msg] ${pubKey} ${addr}`
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

	return module
}	