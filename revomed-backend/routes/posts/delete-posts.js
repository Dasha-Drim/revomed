// request for delete post
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js'); 

const Post = require('../../models/Posts.js');

router.delete('/posts/:id', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) return res.send({success: false, message: 'Вы не авторизованы'});
	if (token.role == 'admin') {
		Post.model.deleteOne({idPost: req.params.id}, function(err) {
			if (!err) res.send({success: true});
			else res.send({success: false, message: "Не удалось удалить пост"});
		});
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'})
	}
});

module.exports = router;