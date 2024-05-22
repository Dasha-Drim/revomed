// generate jwt and rec to cookies
const jsonwebtoken = require('jsonwebtoken');

function issueJWT(id, res, browser, role, confirm = false) {
	let _id = id;
	let expiresIn = 10*60*1000; //10 минут
	let IDbrowser = browser;

	let payload = {
		sub: _id,
		iat: Date.now(),
		expiresIn: expiresIn,
		IDbrowser: IDbrowser,
		role: role,
		confirm: confirm,
	};
	let signedToken = jsonwebtoken.sign(payload, '1234564sgggdvsdg', { expiresIn: expiresIn });
	res.cookie('token', signedToken, { maxAge: expiresIn, secure: true})

	return {
		token: signedToken,
		expires: expiresIn
	}
}

function decodeToken(token) {
	let doc = jsonwebtoken.decode(token);
	return {id: doc.sub, role: doc.role};
}

function updateJWT(token, res, browser) {
	let doc = jsonwebtoken.decode(token);
	let confirm;
	if (!doc) {
		return false;
	}
	if (doc.IDbrowser !== browser) {
		res.clearCookie('token');
		return false;
	}
	confirm = (!doc.confirm) ? false : true;
	
	let role = doc.role;

	if(role == "admin" && originRequest == "https://revomed.ru") return false;

	let _id = doc.sub;
	let expiresIn = 40*24*60*60*1000; // 40 дней
	let IDbrowser = browser;

	let payload = {
		sub: _id,
		iat: Date.now(),
		IDbrowser: IDbrowser,
		role: role,
		confirm: confirm,
	};
	let newToken = jsonwebtoken.sign(payload, '1234564sgggdvsdg', { expiresIn: expiresIn });

	res.cookie('token', newToken, { maxAge: expiresIn, secure: true })
	return {id: payload.sub, role: role, confirm: confirm};
}

function updateAuthJWT(token, res, browser, confirm = false, attempt = 0) {
	let doc = jsonwebtoken.decode(token);
	if (doc.IDbrowser !== browser) {
		res.clearCookie('token');
		return false;
	}

	let role = doc.role;
	let _id = doc.sub;
	if (!doc.attempt) {
		attempt = attempt+1
	} else {
		attempt = doc.attempt+1;
	}

	confirm = (confirm) ? confirm : false;
	let expiresIn = 10*60*1000; // 10 минут
	let IDbrowser = browser;

	let payload = {
		sub: _id,
		iat: Date.now(),
		IDbrowser: IDbrowser,
		role: role,
		confirm: confirm,
		attempt: attempt,
	};

	let newToken = jsonwebtoken.sign(payload, '1234564sgggdvsdg', { expiresIn: expiresIn });

	res.cookie('token', newToken, { maxAge: expiresIn, secure: true })
	return {id: payload.sub, role: role, confirm: confirm, attempt: attempt};
}

module.exports.issueJWT = issueJWT;
module.exports.updateJWT = updateJWT;
module.exports.updateAuthJWT = updateAuthJWT;
module.exports.decodeToken = decodeToken;