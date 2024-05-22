// request for add review
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();
const {DateTime} = require('luxon');

const Review = require('../../models/Reviews.js');
const Doctor = require('../../models/Doctors.js');
const Client = require('../../models/Clients.js');
const Consultation = require('../../models/Consultations.js');
const Notification = require('../../models/Notifications.js');


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

router.post('/reviews/:link', upload.array(), async (req, res, next) => {	
	let docRating, reviewsTotal;
	let allMarks = 0;
	let count = 0;
	let id = 1;
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) return res.send({success: false, message: 'Вы не авторизованы'});
	if (token.role == "client") {
		let reviewConsultation = await Review.model.find({consultation: req.params.link});
		if (reviewConsultation.length > 0) {
			return res.send({success: false, message: "Пользователь может оставить один отзыв врачу"});
		} else {
			let reviews = await Review.model.find({});
			let consultation = await Consultation.model.findOne({link: req.params.link}, {idDoctor: 1});
			if (reviews.length !== 0) id = reviews[reviews.length-1].idReview + 1;
			let client = await Client.model.findOne({idClient: token.id}, {name: 1,socketID: 1});
			let doctor = await Doctor.model.findOne({idDoctor: consultation.idDoctor}, {name: 1, type: 1, idClinic: 1, socketID: 1});
			let review = {
				idReview: id,
				idDoctor: consultation.idDoctor,
				idClient: token.id,
				mark: req.body.mark,
				text: req.body.text,
				consultation: req.params.link,
				clientName: client.name,
				doctorName:doctor.name,
			}
			let newReview = new Review.model(review);
			try {
				let saveReview = await newReview.save();
				let reviewsDoc =  await Review.model.find({idDoctor: consultation.idDoctor});
				if (reviewsDoc.length == 1) {
					docRating = req.body.mark;
					await Doctor.model.updateOne({idDoctor: consultation.idDoctor}, {$set: {rating: docRating, reviewsTotal: 1}}, {upsert: false});					
					sendSocket(doctor.socketID, {text: "Пользователь оставил вам ваш первый отзыв", typeUser: 'doctor', id: +consultation.idDoctor});
					if (doctor.type == 'clinic') {
						let clinic = await Clinic.model.findOne({idClinic: doctor.idClinic}, {socketID: 1});
						sendSocket(clinic.socketID, {text: "Пользователь озтавил отзыв врачу", typeUser: 'clinic', id: doctor.idClinic});
					}
					return res.send({success: true})
				} else {
					for (marks of reviewsDoc) {
						allMarks = allMarks + marks.mark;
						count++;
					}
					docRating = Math.ceil((allMarks/count)*100)/100;					
					await Doctor.model.updateOne({idDoctor: consultation.idDoctor}, {$set: {rating: docRating, reviewsTotal: reviewsDoc.length}}, {upsert: false});
					sendSocket(doctor.socketID, {text: "Пользователь оставил отзыв", typeUser: 'doctor', id: +consultation.idDoctor});
					if (doctor.type == 'clinic') {
						let clinic = await Clinic.model.findOne({idClinic: doctor.idClinic}, {socketID: 1});
						sendSocket(clinic.socketID, {text: "Пользователь озтавил отзыв врачу", typeUser: 'clinic', id: doctor.idClinic});
					}
					return res.send({success: true})
				}
			} catch(err) {
				console.log(err);
				return res.send({success: false, message: 'Не удалось сохранить отзыв'});
			}
		}
	}
})


module.exports = router;