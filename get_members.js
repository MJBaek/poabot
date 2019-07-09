/*
npm install --save tdlib
npm install --save tglib 
*/
const { Client } = require('tglib')

let getMembers = async(chatId) => {
	const client = new Client({
	    apiId: '837226',
	    apiHash: '3d5f0d9a256aef2d1a7867fde72bdb14',
	})
	// Save tglib default handler which prompt input at console
	const defaultHandler = client.callbacks['td:getInput']
	
	// Register own callback for returning auth details
	client.registerCallback('td:getInput', async (args) => {
	    if (args.string === 'tglib.input.AuthorizationType') {
	            return 'bot'
	    } else if (args.string === 'tglib.input.AuthorizationValue') {
	            return '826811748:AAE9j_9xyuRApCJovJuDOkj3f0o03Gz2wQo'
	    }
	    return await defaultHandler(args)
	})
	
	await client.ready
	
	const chatResult = await client.fetch({
	    '@type': 'getChat',
	    'chat_id': chatId,
	})
	
	let chatType = Object.values(chatResult.type)[0]
	let groupId = chatId.substr(0,4) === '-100' ? parseInt(chatId.substr(4)) : parseInt(chatId)
	const groupResult = null
	
	console.log(chatId.substr(0,4))
	console.log(groupId)
	console.log(chatType)
	
	// super group
	if(chatType === 'chatTypeSupergroup'){
	    const groupResult = await client.fetch({
	            '@type': 'getSupergroupMembers',
	            'offset_order': '9223372036854775807',
	            'offset_chat_id': 0,
	            'supergroup_id': groupId,
	            'limit': 100000,
	    })
	    checkMembersAmount(groupResult)
	// basic group
	}else if(chatType === 'chatTypeBasicGroup'){
	    const groupResult = await client.fetch({
	            '@type': 'getBasicGroupMembers',
	            'offset_order': '9223372036854775807',
	            'offset_chat_id': 0,
	            'chat_id': groupId,
	            'limit': 100000,
	    })
	    checkMembersAmount(groupResult)
	}
}
let checkMembersAmount = async(membersInfo)=>{
	membersInfo.members.forEach(m=>{
	    console.log(m.user_id)
	    console.log(m.status)
	})
// console.log(membersInfo)
}
getMembers('-1001199809848')