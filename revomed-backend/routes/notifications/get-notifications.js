//get notifications user
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');

const Notification = require('../../models/Notifications.js');

router.get('/notifications', async (req, res, next) => {
	let currentNotifications = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) return res.send({success: false, message: "Вы не авторизованы"});
	let notifications = await Notification.model.find({idUser: token.id}).sort({$natural: -1}).limit(10);
	for (notify of notifications) {
		let oneNotification = {
			text: notify.text,
			link: notify.link || null,
			date: notify.date,
			read: notify.read,
		}
		currentNotifications.push(oneNotification);
	}
	return res.send({success: true, notifications: currentNotifications});
});

module.exports = router;