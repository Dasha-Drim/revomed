// get categories in all pages
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const {config} = require('../../config/config.js');

const Subcategories = require('../../models/Subcategories.js');
const MainCategories = require('../../models/MainCategories.js');

router.get('/subcategories', async (req, res, next) => {
	let categories = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	//await MainCategories.model.deleteMany();
	//await Subcategories.model.deleteMany();

	if (token.role == "admin") {
		let array = [];
		let categories = await MainCategories.model.find({});
		for (category of categories) {
			array.push({id: category.idCategory, name: category.name, subcategories: []})
			let subcategories = await Subcategories.model.find({idCategory: category.idCategory});
			for (subcategory of subcategories) {
				array[array.length-1].subcategories.push({name: subcategory.name, id: subcategory.idSubcategory, photo: config.backend + subcategory.photo})
			}
		}
		return res.send({success: true, categories: array})
	} else {
		let array = [];
		let categories = await MainCategories.model.find({});
		for (category of categories) {
			array.push({id: category.idCategory, name: category.name, subcategories: []})
			let subcategories = await Subcategories.model.find({idCategory: category.idCategory});
			for (subcategory of subcategories) {
				array[array.length-1].subcategories.push({name: subcategory.name, id: subcategory.idSubcategory, photo: config.backend + subcategory.photo, url: subcategory.url})
			}
		}
		return res.send({success: true, categories: array})
	}
});

module.exports = router;

