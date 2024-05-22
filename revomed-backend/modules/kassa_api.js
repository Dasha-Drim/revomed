let https = require('https');

let randomString = (i) => {
	let rnd = "";
	while (rnd.length < i) 
		rnd += Math.random().toString(36).substring(2);
	return rnd.substring(0, i);
};

module.exports = (object, method = '') => {
	const options = {
		protocol: 'https:',
		host: 'api.yookassa.ru',
		path: '/v3/payments'+method,
		method: 'POST',
		auth: '719702:live_PiU1ldm_0nZEYeKjzK5L8P0r46ZjXs_nK6Ffh-D2Sw8',
		headers: {
			'Idempotence-Key': randomString(40),
			'Content-Type': 'application/json'
		}
	};
	return new Promise((resolve, reject) => {
	  	const curlRequest = https.request(options, (res) => {
	  		let data = "";
	  		res.on('data', (chunk) => data += chunk);
	  		res.on('end', () => {
	  			let answer = JSON.parse(data);
	  			console.log('Body: ', answer);
	  			resolve(answer);
	  		});
	  	}).on("error", (err) => {
			// payment error !!!!!
			console.log("Payment error: ", err.message);
			reject(err);
		});

		curlRequest.write(JSON.stringify(object));
		curlRequest.end();
    });
};