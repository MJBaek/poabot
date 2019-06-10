module.exports = ()=> {
	let module = {}
	//두개의 날짜를 비교하여 차이를 알려준다.
	module.dateDiff = (date1, date2) =>{
	    let diffDate1 = date1 instanceof Date ? date1 : new Date(date1)
	    let diffDate2 = date2 instanceof Date ? date2 : new Date(date2)
//	    let diff = Math.abs(diffDate2.getTime() - diffDate1.getTime())
	    let diff = diffDate1.getTime() - diffDate2.getTime() 
	    let diffObj = {
			sec : Math.ceil(diff / (1000)),
			min : Math.ceil(diff / (1000*60)),
			hour : Math.ceil(diff / (1000*60*60)),
			day : Math.ceil(diff / (1000*60*60*24)),
	    }
	 
	    return diffObj
	}
	//현재 시간  2019-04-01 16:15:37
	module.now = () =>{
		let d = new Date();
		let s =
		leadingZeros(d.getFullYear(), 4) + '-' +
		leadingZeros(d.getMonth() + 1, 2) + '-' +
		leadingZeros(d.getDate(), 2) + ' ' +
		
		leadingZeros(d.getHours(), 2) + ':' +
		leadingZeros(d.getMinutes(), 2) + ':' +
		leadingZeros(d.getSeconds(), 2);

		return s;
	}
	//1자리면 0을 앞에 채워준다.
	let leadingZeros = (n, digits)=>{
		let zero = ''
		n = n.toString()
		
		if (n.length < digits) {
			for (i = 0; i < digits - n.length; i++){
				zero += '0'
			}
		}
		return zero + n
	}
	return module
}
