const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let CategorySchema = new Schema({
  name: String,
  nameRu: String,
  interval: Number,
  duration: Number,
  price: Number,
  license: Boolean, // лицензия 0 -нет, 1 - есть
});

exports.model = mongoose.model("Category", CategorySchema);