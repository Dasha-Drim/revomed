// module for image setting, like orientation and cmpress
const path = require('path');
const fs = require("fs");

const Jimp = require('jimp');
const modifyExif = require('modify-exif');
const sharp = require('sharp');
const gm = require('gm');

const readFileAsync = async(file) => {
	return await new Promise((resolve, reject) => {
		fs.readFile(file, async(err, data) => {
			err ? reject(err) : resolve(data);
		});
	});
};

const correctOrientation = async(image) => {
	let imageOrientation = false;
	let rotateDeg = 0;
	
	let arr = image.filename.split('.');
	if ((arr[arr.length - 1] == 'jpg') || (arr[arr.length - 1] == 'jpeg')) {
		const buffer = modifyExif(await readFileAsync(path.join("uploads") + '/' + image.filename), data => {
			imageOrientation = data && data["0th"] && data["0th"]["274"] ? data["0th"]["274"] : false;

			if (imageOrientation) {
				if (imageOrientation === 1) {
					imageOrientation = false;
				} else {
					data["0th"]["274"] = 1;
				}
			}
		});

		if (imageOrientation) {
			switch (imageOrientation) {
				case 3:
				rotateDeg = 180;
				break;
				case 6:
				rotateDeg = 270;
				break;
				case 8:
				rotateDeg = 90;
				break;
				default:
				rotateDeg = 0;
				break;
			}
			Jimp.read(buffer, (err, lenna) => {

				if (err) {
					console.log('err', err);
					return;
				}
				lenna
			.rotate(rotateDeg) // correct orientation
			.write(path.join("uploads") + '/' + image.filename); // save
		});
		}
	}
};


let compressImage = (image, type) => {
	let arr = image.filename.split('.');
	let filename = arr[0] + 1 + "." + arr[arr.length-1];
	if (type == "post") {
		sharp(path.join( "uploads") + '/' + image.filename)
		//.webp()
		//.toFormat('webp')
		.jpeg({ quality: 50, mozjpeg: true })
		.resize(1280, 960)
		.toFile(path.join( "uploads"+ '/' + arr[0] + 1 + '.jpeg'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
		sharp(path.join( "uploads") + '/' + image.filename)
		.webp()
		.toFormat('webp')
		.resize(1280, 960)
		.toFile(path.join( "uploads"+ '/' + arr[0] + '.webp'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
	}
	if (type == "doctor") {
		sharp(path.join( "uploads") + '/' + image.filename)
		.jpeg({ quality: 50, mozjpeg: true })
		.resize(960, 1280)
		.toFile(path.join( "uploads"+ '/' + arr[0] + 1 + '.jpeg'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
		sharp(path.join( "uploads") + '/' + image.filename)
		.webp()
		.toFormat('webp')
		.resize(960, 1280)
		.toFile(path.join( "uploads"+ '/' + arr[0] + '.webp'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
	}
	if (type == "banner") {
		console.log("image.filename", image.filename)
		sharp(path.join( "uploads") + '/' + image.filename)
		.jpeg({ quality: 50, mozjpeg: true })
		.resize(800, 400)
		.toFile(path.join( "uploads"+ '/' + arr[0] + 1 + '.jpeg'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
		sharp(path.join( "uploads") + '/' + image.filename)
		.webp()
		.toFormat('webp')
		.resize(800, 400)
		.toFile(path.join( "uploads"+ '/' + arr[0] + '.webp'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
	}
	if (type == "product") {
		sharp(path.join( "uploads") + '/' + image.filename)
		.jpeg({ quality: 50, mozjpeg: true })
		.resize(960, 960)
		.toFile(path.join( "uploads"+ '/' + arr[0] + 1 + '.jpeg'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
		sharp(path.join( "uploads") + '/' + image.filename)
		.webp()
		.toFormat('webp')
		.resize(960, 960)
		.toFile(path.join( "uploads"+ '/' + arr[0] + '.webp'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
	}
	if (type == "clinic") {
		sharp(path.join( "uploads") + '/' + image.filename)
		.jpeg({ quality: 50, mozjpeg: true })
		.resize(960, 960)
		.toFile(path.join( "uploads"+ '/' + arr[0] + 1 + '.jpeg'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
		sharp(path.join( "uploads") + '/' + image.filename)
		.webp()
		.toFormat('webp')
		.resize(960, 960)
		.toFile(path.join( "uploads"+ '/' + arr[0] + '.webp'), function(err) {
			if (err) {
				console.log("image-setting err", err)
				return;
			}
		});
	}
	return {imageJpeg: arr[0] + 1 + '.jpeg', imageWebp: arr[0] + '.webp'};
}

module.exports.correctOrientation = correctOrientation;
module.exports.compressImage = compressImage;
