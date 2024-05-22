// add recomendation after consultation
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();
const {DateTime} = require('luxon');

const Consultation = require('../../../models/Consultations.js');
const Notification = require('../../../models/Notifications.js');
const Client = require('../../../models/Clients.js');

let getIORecur = (resolve) => {
	if(typeof io === "undefined") setTimeout(() => getIORecur(resolve), 50);
	else resolve(io);
}

let getIO = new Promise(function(resolve, reject) {
	getIORecur(resolve);
});

let sendSocket = async (id, data = {}) => {
	let ioServer = await getIO;
	let notification = {
		text: data.text,
		idUser: data.id,
		typeUser: data.typeUser,
	}
	let newNotification = new Notification.model(notification);
	try {
		let saveNotification = await newNotification.save();
		ioServer.of("/notify").to(id).emit('newNotification', {text: data.text, date: DateTime.now().toISO(), read: false, link: data.link || null});
	} catch (err) {console.log('err' + err)}
}

router.post('/consultations/recommendations/:link', upload.array(), (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if ((token.role == 'doctor') || (token.role == 'clinicDoctor')) {
		Consultation.model.findOne({link: req.params.link}, (err, consultation) => {
			Consultation.model.updateOne({link: req.params.link}, {$set: {recomendation: req.body.text}}, {upsert: false}, (err, updated) =>{
				if (err) return res.send({success: false, message: 'Не удалось оставить рекомендацию'});
				Client.model.findOne({idClient: consultation.idClient}, (err, client) => {
					sendSocket(client.socketID, {text: "Врач оставил вам рекомендацию", typeUser: 'client', id: +consultation.idClient});
				})
				return res.send({success: true});
			})
		})
	} else {
		return res.send({success: false, message: 'Вы не можете оставить рекомендацию'});
	}
});

module.exports = router;