const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();
const {DateTime}  = require('luxon');

const Promos = require('../../../models/Promos.js');
const Categories = require('../../../models/Categories.js');

// GET REQUEST - GET PROMOS IN CLINIC

router.get('/clinics/promos', upload.array(), async (req, res, next) => {

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
	if (token.role == 'clinic') {
		let arrPromo = [];
		let promos = await Promos.model.find({idClinic: token.id}, {
			name: 1, 
			type: 1, 
			category: 1, 
			idPromo: 1,
			data: 1
		});
		for (promo of promos) {
			let category = await Categories.model.findOne({name: promo.category});
			let item = {
				category: promo.category === "all" ? "Все" : category.nameRu,
				name: promo.name,
				type: promo.type,
				idPromo: promo.idPromo,
				data: {
					dateEnd: promo.type === "fixed" && promo.data.dateEnd ? DateTime.fromFormat(promo.data.dateEnd, "dd.LL.yyyy").toString() : null,
					dateStart: promo.type === "fixed" && promo.data.dateStart ? DateTime.fromFormat(promo.data.dateStart, "dd.LL.yyyy").toString() : null,
					sale: promo.type === "fixed" ? promo.data.sale : null,
					minSale: promo.type === "cumulative" ? promo.data.minSale : null,
					maxSale: promo.type === "cumulative" ? promo.data.maxSale : null,
					numConsultation: promo.type === "cumulative" ? promo.data.numConsultation : null,
					step: promo.type === "cumulative" ? promo.data.step : null,
				},
			}
			arrPromo.push(item);
		}
		return res.send({success: true, promos: arrPromo});		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;