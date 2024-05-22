const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let SubcategorySchema = new Schema({
	idCategory: Number,
	idSubcategory: Number,
	name: String,
	photo: String,
	url: String
});

exports.model = mongoose.model("Subcategory", SubcategorySchema);