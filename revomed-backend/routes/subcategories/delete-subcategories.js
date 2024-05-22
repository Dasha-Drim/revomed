//delete category
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');

const MainCategories = require('../../models/MainCategories.js');
const Subcategories = require('../../models/Subcategories.js');
const Banners = require('../../models/Banners.js');
const Articles = require('../../models/Articles.js');
const Products = require('../../models/Products.js');


router.delete('/subcategories/:id', async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "admin") {
		if (!req.params.id) return res.send({success: false, message: 'Вы не можете удалить пустую категорию'});
		console.log("req.params", req.params)
		console.log("req.query", req.query)
		if (req.query.action == "subcategory") {
			let banners = await Banners.model.find({subcategories: req.params.id});
			let articles = await Articles.model.find({subcategories: req.params.id});
			let products = await Products.model.find({subcategories: req.params.id});

			if (banners.length || articles.length || products.length) return res.send({success: false, message: 'Вы не можете удалить категорию, в котороый есть контент. Необходимо, что бы фармкомпании через личный кабинет перенесли свой контент из удаляемой категории.'});
			
			await Subcategories.model.deleteOne({idSubcategory: req.params.id});

			return res.send({success: true});

		} else if (req.query.action == "category") {
			let subcategories = await Subcategories.model.find({idCategory: req.params.id});
			let content = false;
			for (subcategory of subcategories) {
				let banners = await Banners.model.find({subcategories: subcategory.idSubcategory.toString()});
				let articles = await Articles.model.find({subcategories: subcategory.idSubcategory.toString()});
				let products = await Products.model.find({subcategories: subcategory.idSubcategory.toString()});

				if (banners.length || articles.length || products.length) content = true;
			}
			if (content) return res.send({success: false, message: 'Вы не можете удалить категорию, в котороый есть коентент. Необходимо, что бы фармкомпании через личный кабинет перенесли свой контент из удаляемой категории.'});
			
			await Subcategories.model.deleteMany({idCategory: req.params.id});
			await MainCategories.model.deleteOne({idCategory: req.params.id});

			return res.send({success: true});
			
		}
	}
});

module.exports = router;