// get categories in all pages
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');

const Category = require('../../models/Categories.js');

router.get('/categories', (req, res, next) => {
	let categories = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	if (token.role == "admin") {
		Category.model.find().exec((err, items) => {
			items.forEach((item) => {
				let category = {
					nameRu: item.nameRu,
					name: item.name,
					duration: item.duration,
					interval: item.interval,
					price: item.price,
					license: item.license,
				}
				categories.push(category)
			});
			return res.send({success: true, categories: categories})
		});
	} else {
		Category.model.find().exec((err, items) => {
			items.forEach((item) => {
				let category = {
					title: item.nameRu,
					name: item.name,
					duration: item.duration
				}
				categories.push(category)
			});
			return res.send({success: true, categories: categories})
		});
	}
});

module.exports = router;

