getText = (lang,key,valArr) => {
	let langFile = ""
	let userLang = typeof lang === "undefined" ? "en" : lang //default en
			
	switch(userLang){
		case "ko" :
			langFile = require('../language/ko').text
			break;
			
		case "en" :
			langFile = require('../language/en').text
			break;
			
		default : 
			langFile = require('../language/en').text
			break;
			
	}
	
	if(typeof langFile[key] === "undefined"){
		return "null"
	}else{
		let text = langFile[key]
		
		if(typeof valArr !== "undefined" && valArr.length >0){
			for(let i=0; i<valArr.length; i++){
				text = text.replace("%s"+i,valArr[i])
			}
		}
		return text
	}
}

//console.log(getText('ko','btn_yes'))

//console.log(getText('ko','ad_register_step1_err1',['5,2,3']))
//console.log(getText('en','ad_register_step1_err1',['5,2,3']))
//console.log(getText('ko','ad_register_step1_err2',['test1','test2']))
 
module.exports = {
	getText : getText
}



 
