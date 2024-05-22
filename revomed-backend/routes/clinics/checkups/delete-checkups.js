const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const Checkups = require('../../../models/Checkups.js');

// DELETE REQUEST - DELETE CHECKUPS IN CLINIC

router.delete('/clinics/checkups/:id', upload.array(), async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'clinic') {
		try {
			await Checkups.model.deleteOne({idCheckup: req.params.id});
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось удалить чекап'});
		}	
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;