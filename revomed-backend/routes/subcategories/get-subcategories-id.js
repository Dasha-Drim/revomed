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
const { config } = require('../../config/config.js');

const Subcategories = require('../../models/Subcategories.js');
const Banners = require('../../models/Banners.js');
const Articles = require('../../models/Articles.js');
const Products = require('../../models/Products.js');
const Farms = require('../../models/Farms.js');

router.get('/subcategories/:url', async (req, res, next) => {
    let categories = [];
    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

    //await MainCategories.model.deleteMany();
    //await Subcategories.model.deleteMany();
    if (!token || (token && token.role !== "client")) return res.send({success: false, messagge: "У вас недостаточно прав"})

    let subcategory = await Subcategories.model.findOne({ url: req.params.url });
    console.log("subcategory", subcategory)
    console.log("subcategory.idSubcategory", subcategory.idSubcategory)

    let banners = await Banners.model.find({ subcategories: subcategory.idSubcategory.toString(), status: "show" })
    console.log("banners", banners)

    let products = await Products.model.find({ subcategories: subcategory.idSubcategory.toString(), status: "show" })
    console.log("products", products)

    let articles = await Articles.model.find({ subcategories: subcategory.idSubcategory.toString(), status: "show" }).sort({ $natural: -1 });
    console.log("articles", articles)

    let articlesArr = [];
    let productsArr = [];
    let bannersArr = [];

    for (article of articles) {
        let item = {
            id: article.idArticle,
            photo: config.backend + article.photo,
            date: article.date,
            title: article.name,
            description: article.annotation,
        }
        let farm = await Farms.model.findOne({ idFarm: article.idFarm });
        item.author = farm.name;
        articlesArr.push(item);
    }

    for (product of products) {
    	let name = product.name.slice(0, 55);
        
        let item = {
            id: product.idProduct,
            photo: config.backend + product.photo,
            name:  name.length < product.name.length ? name + "..." : name,
        }

        productsArr.push(item);
    }

    for (banner of banners) {
        let item = {
            photo: config.backend + banner.photo,
            link: banner.link,
        }

        bannersArr.push(item);
    }

    // сортировка

   /* var myarray = [25, 8, "George", "John"]
    myarray.sort(function() {
        return Math.random() - 0.5
    })

    console.log("myarray", myarray)*/


    bannersArr.sort(() => {
        return Math.random() - 0.5
    })

    productsArr.sort(() => {
        return Math.random() - 0.5
    })

    

    let data = {
        name: subcategory.name,
        banners: bannersArr,
        articles: articlesArr,
        products: productsArr,
    };

    console.log("data", data)

    return res.send({ success: true,  subcategory: data});

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