const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let MainCategorySchema = new Schema({
	idCategory: Number,
	name: String,
});

exports.model = mongoose.model("MainCategory", MainCategorySchema);