// request for get posts in blog and other public pages
const express = require('express');
const router = express.Router();
const config = require('../../config/config.js');

const Post = require('../../models/Posts.js');
const Doctor = require('../../models/Doctors.js');
const Clinic = require('../../models/Clinics.js');

router.get('/posts', function(req, res, next) {
	let blog = [];
	
	let getPosts = async () => {
		let item = {};
		const posts = await Post.model.find({}).sort({ $natural: -1 }).limit(+req.query.limit).skip(+req.query.offset);
		if (!posts) return false;
		for (const el of posts) { 
			let post = {
				id: el.idPost,
				title: el.title,
				description: el.annotation,
				photo: config.config.backend + el.photo,
				photoWebp: config.config.backend + el.photoWebp,
				date: el.date,
				typeAuthor: el.typeAuthor,
			}
			if (el.typeAuthor == 'doctor') {
				let doc = await Doctor.model.findOne({idDoctor: +el.author});
				post.author = doc.name;
				blog.push(post);
			} else if (el.typeAuthor == 'clinic') {
				let clinic = await Clinic.model.findOne({idClinic: +el.author})
				post.author = clinic.name;
				blog.push(post);
			} else if (el.typeAuthor == 'admin') {
				post.author = el.author;
				blog.push(post);
			}
		}
		Post.model.countDocuments({}, function (err, count) {
			let pagesAvailable = (req.query.limit) ? Math.ceil(count/req.query.limit) : 1;
			return res.send({success: true, posts: blog, pagesAvailable: pagesAvailable});
		});
	}
	getPosts();
});

module.exports = router;

