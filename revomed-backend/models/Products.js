const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ProductSchema = new Schema({
  name: String,
  description: String,
  shops: Array,
  photo: String,
  photoWebp: String,
  subcategories: Array,
  idFarm: Number,
  idProduct: Number,
  message: String,
  status: {type: String, default: "checking"},
  date: { type: Date, default: Date.now },
});

exports.model = mongoose.model("Product", ProductSchema);