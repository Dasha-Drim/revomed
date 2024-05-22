const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const verify  = require('../../../modules/verify.js');
const multer  = require('multer');
const upload = multer();

const Checkups = require('../../../models/Checkups.js');

// POST REQUEST - ADD CHECKUPS IN CLINIC

router.put('/clinics/checkups', upload.array(), async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'clinic') {
		let verifyPrice = verify.verifyPrice(req.body);
		if (verifyPrice) return res.send({success: false, message: verifyPrice});
		let checkup = {
			name: req.body.name,
			annotation: req.body.annotation,
			description: req.body.description,
			price: req.body.price,
			surveys: JSON.parse(req.body.surveys),
			symptoms: JSON.parse(req.body.symptoms),
			consultation: req.body.consultation ? true : false,
		}
		try {
			await Checkups.model.updateOne({idCheckup: req.body.id}, checkup);
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось сохранить изменения'});
		}		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;