const express = require('express');
const router = express.Router();


router.get('/postbacks', async (req, res) => {
	console.log("req.body", req.body)
	console.log("req.query", req.query)
	
});


module.exports = router;