const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const Promos = require('../../../models/Promos.js');

// DELETE REQUEST - DELETE PROMO FOR DOCTOR

router.delete('/doctors/promos/:id', upload.array(), async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'doctor') {
		try {
			await Promos.model.deleteOne({idPromo: req.params.id});
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось удалить промоакцию.'});
		}	
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;