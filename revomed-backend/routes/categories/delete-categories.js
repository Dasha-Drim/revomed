//delete category
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');

const Category = require('../../models/Categories.js');
const Doctor = require('../../models/Doctors.js');
const Clinic = require('../../models/Clinics.js');

router.delete('/categories/:name', async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "admin") {
		if (!req.params.name) return res.send({success: false, message: 'Вы не можете удалить пустую категорию'});
		let doctors = await Doctor.model.find({category: req.params.name});
		if (doctors.length !== 0) return res.send({success: false, message: 'Вы не можете удалять категорию, если к ней привязаны врачи'});
		try {
			await Category.model.deleteOne({name: req.params.name});
			let clinics = await Clinic.model.find({});
			for (let item of clinics) {
				let newArr = item.price.filter(el => el.category !== req.params.name);
				console.log("newARR !!!!!!", newArr)
				await Clinic.model.updateOne({idClinic: item.idClinic}, {$set: {price: newArr}}, {upsert: false});
				if (item.offline || item.priceOffline) {
					let newArrOffline = item.priceOffline.filter(el => el.category !== req.params.name);
					await Clinic.model.updateOne({idClinic: item.idClinic}, {$set: {priceOffline: newArr}}, {upsert: false})
				}
			}
			return res.send({success: true});
		} catch(err) {
			console.log("err", err);
			return res.send({success: false, message: 'Не удалось удалить категорию'});
		}
	}
});

module.exports = router;