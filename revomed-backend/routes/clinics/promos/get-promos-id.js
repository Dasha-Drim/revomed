const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();
const {DateTime}  = require('luxon');

const Promos = require('../../../models/Promos.js');

// GET REQUEST - GET ONE PROMO IN CLINIC

router.get('/clinics/promos/:id([0-9]+)', upload.array(), async (req, res, next) => {

	let id = 1;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (token && token.role == 'clinic') {
		let promo = await Promos.model.findOne({idPromo: req.params.id}, {
			name: 1, 
			type: 1, 
			category: 1, 
			data: 1, 
			idPromo: 1,
		});
		let info = {
			name: promo.name,
			type: promo.type, 
			category: promo.category, 
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
		return res.send({success: true, promo: info});		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;