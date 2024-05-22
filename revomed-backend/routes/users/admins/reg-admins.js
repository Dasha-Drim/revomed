//request for auth admins
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const Admin = require('../../../models/Admins.js');

router.post('/reg/admins', (req, res, next) => {
	
	let salt = crypto.randomBytes(32).toString('hex');
	let hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 64, 'sha512').toString('hex');
	
	let newAdmin = new Admin.model({login: req.body.login, password: hash, salt: salt});
	newAdmin.save(function (err) {
		return res.send('fff')
	})
});

module.exports = router;