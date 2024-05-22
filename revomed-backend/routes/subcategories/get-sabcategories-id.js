/*
let [subcategory, setSubcategory] = useState({
        name: "Грудное вскармливание",
        banners: [banner, banner, banner, banner, banner],
        articles: [
        {id: 1, photo: banner, author: "Фармакологическая компания “МедПлюс”", date: "2022-11-12T20:39:25.230Z", title: "Как сохранить отношения в условиях карантина", description: "Вы можете обратиться к Денису, если чувствуете, что вам стало тяжело справляться с тем, что происходит в жизни. Или то, как вы с этим справляетесь, не приносит удовлетворения."},
        {id: 1, photo: banner, author: "Фармакологическая компания “МедПлюс”", date: "2022-11-12T20:39:25.230Z", title: "Как сохранить отношения в условиях карантина", description: "Вы можете обратиться к Денису, если чувствуете, что вам стало тяжело справляться с тем, что происходит в жизни. Или то, как вы с этим справляетесь, не приносит удовлетворения."},
        {id: 1, photo: banner, author: "Фармакологическая компания “МедПлюс”", date: "2022-11-12T20:39:25.230Z", title: "Как сохранить отношения в условиях карантина", description: "Вы можете обратиться к Денису, если чувствуете, что вам стало тяжело справляться с тем, что происходит в жизни. Или то, как вы с этим справляетесь, не приносит удовлетворения."},
        {id: 1, photo: banner, author: "Фармакологическая компания “МедПлюс”", date: "2022-11-12T20:39:25.230Z", title: "Как сохранить отношения в условиях карантина", description: "Вы можете обратиться к Денису, если чувствуете, что вам стало тяжело справляться с тем, что происходит в жизни. Или то, как вы с этим справляетесь, не приносит удовлетворения."},
        {id: 1, photo: banner, author: "Фармакологическая компания “МедПлюс”", date: "2022-11-12T20:39:25.230Z", title: "Как сохранить отношения в условиях карантина", description: "Вы можете обратиться к Денису, если чувствуете, что вам стало тяжело справляться с тем, что происходит в жизни. Или то, как вы с этим справляетесь, не приносит удовлетворения."}
        ],
        products: [
        {id: 1, name: "Алтайвитамины Ревит «Алтайвитамины», комплекс витаминов...", photo: product},
        {id: 1, name: "Алтайвитамины Ревит «Алтайвитамины», комплекс витаминов...", photo: product},
        {id: 1, name: "Алтайвитамины Ревит «Алтайвитамины», комплекс витаминов...", photo: product},
        {id: 1, name: "Алтайвитамины Ревит «Алтайвитамины», комплекс витаминов...", photo: product},
        {id: 1, name: "Алтайвитамины Ревит «Алтайвитамины», комплекс витаминов...", photo: banner}
        ]
    })
*/

// get categories in all pages
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const {config} = require('../../config/config.js');

const Subcategories = require('../../models/Subcategories.js');
const Banners = require('../../models/Banners.js');
const Articles = require('../../models/Articles.js');
const Products = require('../../models/Products.js');

router.get('/subcategories/:url', async (req, res, next) => {
	let categories = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	//await MainCategories.model.deleteMany();
	//await Subcategories.model.deleteMany();

	let subcategory = await Subcategories.model.findOne({url: req.params.url});
	return res.send({success: true})

	/*if (token.role == "admin") {
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
	}*/
});

module.exports = router;