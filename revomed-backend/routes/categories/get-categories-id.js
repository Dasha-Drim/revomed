// get info about one category
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');

const Category = require('../../models/Categories.js');
const Doctors = require('../../models/Doctors.js');

router.get('/categories/:docId', (req, res, next) => {
	let categories = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	Doctors.model.findOne({idDoctor: req.params.docId}).exec((err, doc) => {
		Category.model.findOne({name: doc.category}).exec((err, item) => {
				let category = {
					title: item.nameRu,
					name: item.name,
					duration: item.duration
				}
			return res.send({success: true, category: category})
		});
	});
});

module.exports = router;

