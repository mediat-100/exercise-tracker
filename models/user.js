const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		username: {
			required: true,
			type: String,
		},
		__v: {
			select: false,
		},
	},
);

const User = mongoose.model('User', userSchema);

module.exports = User;