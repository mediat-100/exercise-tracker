const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
	description: {
		required: true,
		type: String,
	},
	duration: {
		type: Number,
		required: true,
	},
	date: {
		type: Date,
	},
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		select: false,
	},
	__v: {
		select: false,
	},
});


const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
