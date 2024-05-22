//request for update doctor info
const express = require('express');
const router = express.Router();
const jwt = require('../../../../modules/jwt.js');

router.get('/farms/articles/link', async (req, res, next) => {
    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    return res.send({success: 1, link: req.query.link, meta: {}})  
})

module.exports = router;