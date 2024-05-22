// add categories
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const Category = require('../../models/Categories.js');
const Clinic = require('../../models/Clinics.js');

router.post('/categories', upload.array(), async (req, res, next) => {
	//let prices = [];

	let addCategory = async (price) => {
		let clinics = await Clinic.model.find({});
		for (clinic of clinics) {
			let categoryIndex = clinic.price.findIndex(currentValue => currentValue.category == price.category);
			if (categoryIndex !== -1) continue;
			let newPrices = clinic.price;
			newPrices.push(price)
			await Clinic.model.updateOne({idClinic: clinic.idClinic}, {$set: {price: newPrices}}, {upsert: false});
			if (clinic.offline || clinic.priceOffline) {
				let categoryOfflineIndex = clinic.priceOffline.findIndex(currentValue => currentValue.category == price.category);
				if (categoryOfflineIndex !== -1) continue;
				let newPricesOffline = clinic.priceOffline;
				newPricesOffline.push(price)
				await Clinic.model.updateOne({idClinic: clinic.idClinic}, {$set: {priceOffline: newPricesOffline}}, {upsert: false});
			}
		}
	}

	let removeCategories = async (arr) => {
		console.log("removeCategory")
		let clinics = await Clinic.model.find({});
		for (clinic of clinics) {
			let m1 = clinic.price;
			let m2 = arr;
			let arrIndex = [];
			for (let i = 0; i < m1.length; i++) {
				let index = m2.findIndex(currentValue => currentValue.name.replace(/\s+/g, '') == m1[i].category);
				if (index == -1) arrIndex.push(i);	
				}
				arrIndex.reverse();
				for (item of arrIndex) {
					m1.splice(item, 1);
				}
				await Clinic.model.updateOne({idClinic: clinic.idClinic}, {$set: {price: m1}}, {upsert: false});
			}
			if (clinic.offline || clinic.priceOffline) {
				let m1 = clinic.priceOffline;
				let m2 = arr;
				let arrIndex = [];
				for (let i = 0; i < m1.length; i++) {
					let index = m2.findIndex(currentValue => currentValue.name.replace(/\s+/g, '') == m1[i].category);
					if (index == -1) arrIndex.push(i);	
				}
				arrIndex.reverse();
				for (item of arrIndex) {
					m1.splice(item, 1);
				}
				await Clinic.model.updateOne({idClinic: clinic.idClinic}, {$set: {priceOffline: m1}}, {upsert: false});
			}
		}




	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'admin') {
		await Category.model.deleteMany({});

		let arr = JSON.parse(req.body.categories);
		console.log("arr", arr)
		for (category of arr) {
			let item = {
				nameRu: category.nameRu,
				interval: category.interval,
				price: category.price,
				duration: category.duration,
				license: category.license,
				name: category.name.replace(/\s+/g, ''),
			}
			let onePrice = {
				category: category.name.replace(/\s+/g, ''),
				price: category.price,
				title: category.nameRu,
			}
			try {
				await new Category.model(item).save();
				await addCategory(onePrice);
			} catch (err) {
				console.log("err", err);
				return res.send({success: false, message: 'Не удалось сохранить категории'});
			}

		}
		await removeCategories(arr);
		return res.send({success: true});
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;



/*
	let priceArr = [];
	let updateAllClinics = async (onePrice, key, arr, priceArrValue) => {
		priceArr.push(onePrice);
		let clinics = await Clinic.model.find({});
		for (const clinic of clinics) {
			if (key == (arr.length -1)) {
				let d = await Clinic.model.updateOne({idClinic: clinic.idClinic}, {$set: {price: priceArr}}, {upsert: false});
				return res.send({success: true})
			}
		}
	}
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'admin') {
		Category.model.remove({}, (err, removed) => {
			let categoriesArray = JSON.parse(req.body.categories);
			categoriesArray.forEach((category, key, arr) => {
				let name;
				let item = {
					nameRu: category.nameRu,
					interval: category.interval,
					price: category.price,
					duration: category.duration,
					license: category.license,
				}
				name = category.name.replace(/\s+/g, '');
				item.name = name;
				let newCategory = new Category.model(item);
				let onePrice = {
					category: name,
					price: category.price,
					title: category.nameRu,
				}
				newCategory.save((err) => {
					if (err) return res.send({success: false, message: 'Не удалось добавить категорию'});
					updateAllClinics(onePrice, key, arr, priceArr);
				})
			})
		})
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}

*/