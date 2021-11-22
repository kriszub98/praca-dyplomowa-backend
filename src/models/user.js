const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
	login: {
		type: String,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 8
	},
	email: {
		type: String,
		required: true,
		trim: true
	},
	tokens: [
		{
			token: {
				type: String,
				required: true
			}
		}
	]
});

userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

// Hashing Plane Password
userSchema.pre('save', async function(next) {
	const user = this;

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

// TODO: VALIDATE PASS
// TODO: BLOCKED & FAVS DISHES
