const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer = require('multer');
const upload = multer();

const Articles = require('../../../models/Articles.js');

// DELETE REQUEST - DELETE CHECKUPS IN CLINIC

router.delete('/farms/articles/:id', upload.array(), async (req, res, next) => {
    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== 'farm') return res.send({ success: false, message: 'У вас недостаточно прав' });
    try {
        await Articles.model.deleteOne({ idArticle: req.params.id });
        return res.send({ success: true });
    } catch (err) {
        return res.send({ success: false, message: 'Не удалось удалить статью' });
    }

});

module.exports = router;