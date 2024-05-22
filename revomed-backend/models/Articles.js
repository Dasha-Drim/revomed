const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ArticleSchema = new Schema({
  name: String,
  annotation: String,
  description: Object,
  photo: String,
  photoWebp: String,
  author: String,
  subcategories: Array,
  idFarm: Number,
  idArticle: Number,
  message: String,
  status: {type: String, default: "checking"},
  date: { type: Date, default: Date.now },
});

exports.model = mongoose.model("Article", ArticleSchema);