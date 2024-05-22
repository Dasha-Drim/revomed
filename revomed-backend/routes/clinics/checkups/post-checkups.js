const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const verify  = require('../../../modules/verify.js');
const multer  = require('multer');
const upload = multer();

const Checkups = require('../../../models/Checkups.js');

// POST REQUEST - ADD CHECKUPS IN CLINIC

router.post('/clinics/checkups', upload.array(), async (req, res, next) => {

	let id = 1;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'clinic') {

		let verifyPrice = verify.verifyPrice(req.body);
		if (verifyPrice) return res.send({success: false, message: verifyPrice});

		let checkups = await Checkups.model.find({})
		if (checkups.length !== 0) id = checkups[checkups.length-1].idCheckup + 1;

		let checkup = {
			name: req.body.name,
			annotation: req.body.annotation,
			description: req.body.description,
			price: req.body.price,
			surveys: JSON.parse(req.body.surveys),
			symptoms: JSON.parse(req.body.symptoms),
			idCheckup: id,
			consultation: req.body.consultation ? true : false,
			idClinic: token.id,
		}
		try {
			await new Checkups.model(checkup).save()
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось добавить чекап'});
		}		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;