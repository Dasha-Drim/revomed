const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let BannerSchema = new Schema({
  name: String,
  link: String,
  photo: String,
  photoWebp: String,
  subcategories: Array,
  idFarm: Number,
  idBanner: Number,
  message: String,
  status: {type: String, default: "checking"},
  date: { type: Date, default: Date.now },
});

exports.model = mongoose.model("Banner", BannerSchema);