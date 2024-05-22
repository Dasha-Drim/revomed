// request for update review
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const Review = require('../../models/Reviews.js');

router.put('/reviews', upload.array(), (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "admin") {
		Review.model.updateOne({idReview: req.body.id}, {$set: {text: req.body.text}}, (err) => {
			if (err) return res.send({success: false, message: 'Не удалось обновить отзыв'});
			return res.send({success: true});
		})
	} else {
		return res.send({success: false, message: "У вас недостаточно прав"})
	}
});

module.exports = router;