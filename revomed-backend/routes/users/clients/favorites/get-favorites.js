// request for get client's favorites
const express = require('express');
const router = express.Router();
const jwt = require('../../../../modules/jwt.js');
const config = require('../../../../config/config.js');

const Client = require('../../../../models/Clients.js');
const Post = require('../../../../models/Posts.js');
const Doctor = require('../../../../models/Doctors.js');

router.get('/clients/favorites', async (req, res, next) => {
	let favoriteDoctors = [];
	let oneDoctor;
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'client') {
		let user = await Client.model.findOne({idClient: token.id}, {favoriteDoctors: 1});
		if (user.favoriteDoctors.length == 0) {
			return res.send({success: true, doctors: favoriteDoctors});
		} else  {
			for (docId of user.favoriteDoctors) {
				let doctorInfo = await Doctor.model.findOne({idDoctor: docId});
				oneDoctor = {
					id: doctorInfo.idDoctor,
					name: doctorInfo.name,
					academicDegree: doctorInfo.academicDegree,
					price: doctorInfo.price,
					category: doctorInfo.category,
					experience: doctorInfo.experience,
					rating: doctorInfo.rating.toFixed(1),
					avatar: config.config.backend + doctorInfo.avatar,
				}
				favoriteDoctors.push(oneDoctor);
			}
			favoriteDoctors.reverse();
			return res.send({success: true, doctors: favoriteDoctors});
		} 
	}
});

module.exports = router;

