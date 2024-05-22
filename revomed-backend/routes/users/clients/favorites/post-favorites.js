// request for add or delete favorites
const express = require('express');
const router = express.Router();
const jwt = require('../../../../modules/jwt.js');

const Client = require('../../../../models/Clients.js');

router.post('/clients/favorites', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	let favorites = [];
	let index;
	if (!token) return res.send({success: false, message: 'Вы не авторизованы'});
	if (token.role == 'client') {
		if (req.body.type == 'doctor') {
			Client.model.findOne({idClient: token.id}, {favoriteDoctors: 1}, (err, user) => {
				favorites = user.favoriteDoctors;
				if (favorites.includes(req.body.id)) {
					index = favorites.indexOf(req.body.id);
					if (index !== -1) {
						favorites.splice(index, 1);
					}
					Client.model.updateOne({idClient: token.id}, {$set: {favoriteDoctors: favorites}}, {upsert: false}, (err, update) => {
						if (!err) return res.send({success: true, isInFavoritesNow: false});
						return res.send({success: false, message: 'Не удалось удалить врача из избранного'})
					})
				} else {
					favorites.push(req.body.id);
					Client.model.updateOne({idClient: token.id}, {$set: {favoriteDoctors: favorites}}, {upsert: false}, (err, update) => {
						if (!err) return res.send({success: true, isInFavoritesNow: true});
						return res.send({success: false, message: 'Не удалось добавить врача в избранное'})
					})
				}
			})
		}
	}
});

module.exports = router;