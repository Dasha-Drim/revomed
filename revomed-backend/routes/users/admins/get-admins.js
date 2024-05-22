//request for get auth admins
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');

router.get('/admins', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false});
	}
	if (token.role == 'admin') {
		return res.send({success: true});
	} else {
		return res.send({success: false})
	}
	
});

module.exports = router;