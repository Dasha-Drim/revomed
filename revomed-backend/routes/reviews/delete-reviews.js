// request for delete review (only admin)
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');

const Review = require('../../models/Reviews.js');
const Doctor = require('../../models/Doctors.js');

router.delete('/reviews/:id', (req, res, next) => {
	let rating;
	let allMarks = 0;
	let count = 0;
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == "admin") {
		Review.model.findOne({idReview: req.params.id}, (err, review) => {
			Review.model.deleteOne({idReview: review.idReview}, (err) => {
				if (!err) {
					Review.model.find({idDoctor: review.idDoctor}, (err, reviews) => {
						if (reviews.length == 0) {
							rating = 0;
							Doctor.model.updateOne({idDoctor: review.idDoctor}, {rating: rating}, {upsert: false}, (err, updateReview) =>{
								if (!err) res.send({success: true});
							})
						} else {
							reviews.forEach(oneReview => {
								allMarks = allMarks + oneReview.mark;
								count++;
							})
							rating = Math.ceil((allMarks/count)*100)/100;
							Doctor.model.updateOne({idDoctor: review.idDoctor}, {rating: rating}, {upsert: false}, (err, updateReview) =>{
								if (!err) res.send({success: true});
							})
						}
					})
				}
				else {
					res.send({success: false, message: 'Не удалось удалить отзыв'});
				}
			})
		})
	}
});

module.exports = router;