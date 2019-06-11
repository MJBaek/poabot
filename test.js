const {log4js} = require('./setting/log4js')
const logger = log4js
const gaiacli = require('./gaiacli/gaiaclient')(logger)

//let addr = "cosmos1h08qhe7736c0fu6messs4vyqjfvmtk08gc7ru4"
let addr = "cosmos1tl8q0facf2fl3leenh6pc0uvjyqdwcdhus7uyk"
	
gaiacli.accountCheck(addr).then((res)=>{
	let json = JSON.parse(res)
	let coinAmount = parseInt(json.amount)
	let coinDenom = json.denom
//	logger.debug(res)
	
	gaiacli.stakingCheck(addr).then((res2)=>{
		let json2 = JSON.parse(res2)
		coinAmount += json2.amount
		logger.debug(coinAmount)
	})
	
})