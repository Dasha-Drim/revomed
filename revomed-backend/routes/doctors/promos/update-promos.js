const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const verify  = require('../../../modules/verify.js');
const multer  = require('multer');
const upload = multer();

const Promos = require('../../../models/Promos.js');

// PUT REQUEST - UPDATE PROMO FOR DOCTOR

router.put('/doctors/promos', upload.array(), async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'doctor') {
		let promo = {
			name: req.body.name,
			type: req.body.type,
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
			/*if (req.body.dateEnd && req.body.dateStart) {
				let dateEndArr = req.body.dateEnd.split(".");
				promoInfo.dateEnd = DateTime.fromObject({day: dateEndArr[0], month: dateEndArr[1], year: dateEndArr[2]}).toISO();
				let dateStartArr = req.body.dateStart.split(".");
				promoInfo.dateStart = DateTime.fromObject({day: dateStartArr[0], month: dateStartArr[1], year: dateStartArr[2]}).toISO();
			}*/
		}

		if (req.body.type === "cumulative") {
			let verifySaleCumulative = verify.verifySaleCumulative(req.body);
			if (verifySaleCumulative) return res.send({success: false, message: verifySaleCumulative});

			promoInfo.minSale = req.body.minSale;
			promoInfo.maxSale = req.body.maxSale;
			promoInfo.step = req.body.step;
			promoInfo.numConsultation = req.body.numConsultation;
		}

		promo.data = promoInfo;
		try {
			await Promos.model.updateOne({idPromo: req.body.id}, promo);
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось сохранить изменения'});
		}		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;