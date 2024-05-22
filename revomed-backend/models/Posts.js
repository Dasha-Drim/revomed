const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PostSchema = new Schema({
  title: String,
  annotation: String,
  description: Object,
  photo: String,
  photoWebp: String,
  typeAuthor: String, // clinic, doctors, admin
  author: String,
  category: String,
  idPost: Number,
  date: { type: Date, default: Date.now },
});

exports.model = mongoose.model("Post", PostSchema);