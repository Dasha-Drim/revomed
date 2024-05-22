const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const verify  = require('../../../modules/verify.js');
const multer  = require('multer');
const upload = multer();

const {DateTime}  = require('luxon');

const Promos = require('../../../models/Promos.js');
const Doctors = require('../../../models/Doctors.js');

// POST REQUEST - ADD PROMOS FOR DOCTOR

router.post('/doctors/promos', upload.array(), async (req, res, next) => {

	let id = 1;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	console.log("req body", req.body)
	if (token.role == 'doctor') {

		let promos = await Promos.model.find({})
		if (promos.length !== 0) id = promos[promos.length-1].idPromo + 1;

		let doctor = await Doctors.model.findOne({idDoctor: token.id}, {category: 1});

		let promo = {
			idPromo: id,
			name: req.body.name,
			type: req.body.type,
			category: doctor.category,
			idDoctor: token.id			
		}

		let promoInfo = {};

		if (req.body.type === "fixed") {
			let verifySaleFixed = verify.verifySaleFixed(req.body);
			if (verifySaleFixed) return res.send({success: false, message: verifySaleFixed});

			promoInfo.sale = req.body.sale;
			if (req.body.dateEnd && req.body.dateStart) {
				promoInfo.dateEnd = req.body.dateEnd;
				promoInfo.dateStart = req.body.dateStart;
			}
		}

		if (req.body.type === "cumulative") {
			let verifySaleCumulative = verify.verifySaleCumulative(req.body);
			console.log("verifySaleCumulative", verifySaleCumulative)
			if (verifySaleCumulative) return res.send({success: false, message: verifySaleCumulative});

			promoInfo.minSale = req.body.minSale;
			promoInfo.maxSale = req.body.maxSale;
			promoInfo.step = req.body.step;
			promoInfo.numConsultation = req.body.numConsultation;
		}

		promo.data = promoInfo;

		console.log("promopromo", promo)

		try {
			await new Promos.model(promo).save()
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось добавить промоакцию'});
		}		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;