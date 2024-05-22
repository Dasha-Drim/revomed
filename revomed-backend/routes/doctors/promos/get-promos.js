const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();
const {DateTime} = require('luxon');


const Promos = require('../../../models/Promos.js');

// GET REQUEST - GET PROMOS FOR INDIVIDUAL DOCTORS

router.get('/doctors/promos', upload.array(), async (req, res, next) => {

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
	if (token.role == 'doctor') {
		let promos = await Promos.model.find({idDoctor: token.id}, {
			name: 1, 
			type: 1, 
			idPromo: 1,
			data: 1
		});
		//console.log("promos", promos);
		let promosArr = [];
		for (promo of promos) {
			let info = {
				name: promo.name,
				type: promo.type,
				data: {
					dateEnd: promo.type === "fixed" && promo.data.dateEnd ? DateTime.fromFormat(promo.data.dateEnd, "dd.LL.yyyy").toString() : null,
					dateStart: promo.type === "fixed" && promo.data.dateStart ? DateTime.fromFormat(promo.data.dateStart, "dd.LL.yyyy").toString() : null,
					sale: promo.type === "fixed" ? promo.data.sale : null,
					minSale: promo.type === "cumulative" ? promo.data.minSale : null,
					maxSale: promo.type === "cumulative" ? promo.data.maxSale : null,
					numConsultation: promo.type === "cumulative" ? promo.data.numConsultation : null,
					step: promo.type === "cumulative" ? promo.data.step : null,
				},
				idPromo: promo.idPromo,
			}
			promosArr.push(info)
		}

		return res.send({success: true, promos: promosArr});		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;