const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let DoctorSchema = new Schema({
	fio: { type: String, default: "" },
	name: { type: String, default: "" },
	email: { type: String, default: "" },
	category: { type: String, default: "" },
	academicDegree: { type: String, default: "" },
	directions: { type: Array, default: [] }, // направления
	rating: { type: Number, default: 5 },
	experience: { type: Number, default: 0 },
	country: { type: String, default: "" },
	city: { type: String, default: "" },
	doctorType: {type: String, default: "individual"}, //clinic
	idClinic: String,
	licenseNumber: { type: String, default: "" },
	passportFile: { type: Array, default: [] },
	licenseFile: { type: String, default: "" },
	description: { type: String, default: "" },
	education: { type: Array, default: [] },
	workExperience: { type: Array, default: [] },
	avatar: { type: String, default: "" },
	avatarWebp: { type: String, default: "" },
	timetable: { type: Array, default: [] },
	price: { type: Number, default: 0 },
	balance: { type: Number, default: 0 },
	sex: { type: Number, default: 0 }, // 1 - woman, 0 - man
	idDoctor: { type: Number, default: 1 },
	reviewsTotal: { type: Number, default: 0 },
	pacientsTotal: { type: Number, default: 0 },
	timezone: String,
	socketID: String,
	priority: Number,
	shopID: String,
  	priceOffline: Number,
  	adress: Object,
  	//!!!
  	modules: {
    	promo: {type: Boolean, default: false},
  	}
});

exports.model = mongoose.model("Doctor", DoctorSchema);