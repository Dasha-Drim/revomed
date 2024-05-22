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


router.post('/reviews', upload.array(), async (req, res, next) => {	
	let docRating;
	let allMarks = 0;
	let count = 0;
	let id = 1;
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) return res.send({success: false, message: 'Вы не авторизованы'});

	if (req.body.date === "" || req.body.mark === "" || req.body.clientName === "" || req.body.description === "") return res.send({success: false, message: "Вы отправили не все данные"})
	if (!req.body.idClinic && !req.body.idDoctor) return res.send({success: false, message: "Вы отправили не все данные"})

	if (+req.body.mark > 5 || +req.body.mark < 1) return res.send({success: false, message: "Оценка должна быть больше 1 и меньше 5 баллов"});

	if (!new RegExp("[0-9]{2}\/[0-9]{2}\/[0-9]{4}").test( req.body.date)) return res.send({success: false, message: "Дата в неправильном формате. Введите дату нужном виде: dd/mm/yyyy"});
	let arrDate = req.body.date.split("/")
	if (arrDate[0] > 31 || arrDate[1] > 12) return res.send({success: false, message: "Вы ввели некорректные значения в поле даты"});

	if (token.role == "admin") {
		console.log("req.body", req.body)
		//let arrDate = req.body.date.split("/")
		let date = DateTime.fromObject({year: arrDate[2], month: arrDate[1], day: arrDate[0]}).toISO();
		let reviews = await Review.model.find({});
		if (reviews.length !== 0) id = reviews[reviews.length-1].idReview + 1;


		if (req.body.idClinic && !req.body.idDoctor) {
			console.log("clinic review")
			let review = {
				idReview: id,
				idClinic: +req.body.idClinic,
				mark: req.body.mark,
				text: req.body.description,
				clientName: req.body.clientName,
				date: date,
			}
			let newReview = new Review.model(review);
			try {
				let saveReview = await newReview.save();
				return res.send({success: true})
			} catch(err) {
				console.log(err);
				return res.send({success: false, message: 'Не удалось сохранить отзыв'});
			}
		} else {
			let doctor = await Doctor.model.findOne({idDoctor: +req.body.idDoctor}, {name: 1, pacientsTotal: 1});
			let review = {
				idReview: id,
				idDoctor: +req.body.idDoctor,
				mark: req.body.mark,
				text: req.body.description,
				clientName: req.body.clientName,
				doctorName: doctor.name,
				date: date,
			}
			let newReview = new Review.model(review);
			try {
				let saveReview = await newReview.save();
				let reviewsDoc =  await Review.model.find({idDoctor: +req.body.idDoctor});
				for (marks of reviewsDoc) {
					allMarks = allMarks + marks.mark;
					count++;
				}
				docRating = Math.ceil((allMarks/count)*100)/100;
				await Doctor.model.updateOne({idDoctor: +req.body.idDoctor}, {$set: {rating: docRating, reviewsTotal: reviewsDoc.length, pacientsTotal: doctor.pacientsTotal++}}, {upsert: false});
				return res.send({success: true})
			} catch(err) {
				console.log(err);
				return res.send({success: false, message: 'Не удалось сохранить отзыв'});
			}
		}

	}
})


module.exports = router;