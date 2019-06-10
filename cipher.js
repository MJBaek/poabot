const crypto = require('crypto')
//require('dotenv').config()
const iv = process.env.ENC_IV
const key = process.env.ENC_KEY



const encrypt = (data) => {
	var decodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest()
	var cipher = crypto.createCipheriv('aes-256-cbc', decodeKey, iv)
	return cipher.update(data, 'utf8', 'base64') + cipher.final('base64')
}

const decrypt = (data) => {
	var encodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest()
	var cipher = crypto.createDecipheriv('aes-256-cbc', encodeKey, iv)
	return cipher.update(data, 'base64', 'utf8') + cipher.final('utf8')
}
const randomStr = (length) => {
   let result           = ''
   let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   let charactersLength = characters.length
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
   }
   return result
}
const test = ()=>{
	
	let json = {
			"action" : "sign",
			"requester_t_id" : "826811748", // int poaBotTelegramId
			"tx" : {
				"from": "cosmos1tl8q0facf2fl3leenh6pc0uvjyqdwcdhus7uyk", //인증할 계좌주소
				"denom": "stasia",
				"memo" : "randomStr" //사인 해야할 텍스트
			 
			 },
			 "callback": {
			 	"url": "http://35.230.72.133:9104",
		  		"endpoint": "sign",
		  		"custom_fields": {
					"custom_field1": "It’s custom field1",
				}
			
		  	}
	}
	
	let enc = encrypt(JSON.stringify(json))
//	let dec = decrypt(enc)
	console.log(enc)
	//lmi::1::LOJ4K82SQuze+m8Vupk+k37r+eo7jMlaAm3rUb+RIywym/AYcgM3uyRcPyYABxaXS6Hutx7fKkxW5Qw/ewIln0e6c4qVsbxR45V1PGDhHDUSSGuC6BdvJ4kJYGMd6VgMp9lYUbtx7sfh7mOuiGk7xt7p1Ejt9geE8mK/gmPPvEODDxEzz1nyKHqC91nP+S/EqJBTqYnPLX0pD0K3RFWyhn+u61d1+QMu1M49a222Je7V1urx68AKJoFnYfO7gbM7s3osktFkwEDxn6tqKMHcZEBVG25xXRROyCCS+gi6I9xflqXxWLFA1C35kc/6qYu90GiqFZ+P8udGhAgPHrkta8kFjRqvaHgMDQO8l/a5cs0=
//	console.log(dec)
//	console.log(decrypt("MX+MCwHCi98HZm/4Zxk03dhX18/opY3CdL2/llztzDZJkMxwm3vXbBArnrxpmxS3l8UT3r4Ya4EDBu9wuL1owE2CkybJxuhLJn9hf13M1/VayKJLH0GLaekQmGtm1wLEh1PYd4Ne3OZp+/fWAQITjoOfffiFlwlY4htSl5h2zQHQ6QulURGnwf4iR2TWJKnXAM46v1EL9qOOkIU5TfBdNHLPqyDdgvdawDKcZjbx2M0fYbftAdtn1QWpCjO+rqqkDEUQrwWZZYqEz5ziPU5GwIJUTVQ49bbiK6HN1oqWZBG1BKKMbfw+ZOcyBKUjUXQi2nbys7JK4GpyD+5Z5G7cb0dwQgYyqP6BKGdTfV4etvmGrJf2ZVhaq2wzZHxd8opG0VDOlYY1RCl++tCOIUBZSGl9uTPMbryIat1ztl3k/Uc="))
	
}
test()

module.exports = {
		encrypt : encrypt,
		decrypt : decrypt,
		randomStr: randomStr,
		test : test
}