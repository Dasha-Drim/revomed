//request for auth admins
const express = require('express');
const router = express.Router();
const passport = require('../../../modules/passport.js');
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

router.post('/auth/admins', upload.array(), (req, res, next) => {
	console.log("auth/admins")
	passport.authenticate('login-admins', {session: false }, function(err, user, info) {
		if (!user) { 
			return res.send({success: false, message: 'Неправильные данные'}) 
		} else {
			jwt.issueJWT(1, res, req.headers["user-agent"], 'admin', true, true);
			return res.send({success: true});
		}
		return res.send({success: false, message: 'Ошибка на сервере'});
	})(req, res, next);
});

module.exports = router;