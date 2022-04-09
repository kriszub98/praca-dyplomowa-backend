const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
	login: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 8,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error('Password cannot contain "password"!');
			}
		}
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is not valid');
			}
		}
	},
	pwz: {
		type: String,
		required: false,
		trim: true
	},
	isAdmin: {
		type: Boolean,
		required: false,
		default: false
	},
	allergies: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Allergy'
		}
	],
	favouriteRecipes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Recipe'
		}
	],
	tokens: [
		{
			token: {
				type: String,
				required: true
			}
		}
	]
});

userSchema.virtual('isDoctor').get(function() {
	return this.pwz ? true : false;
});

userSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject({ virtuals: true });

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.pwz;
	delete userObject.id;

	return userObject;
};

userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

// Login Method
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email }).populate('allergies');
	if (!user) {
		throw new Error('Unable to login');
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Unable to login');
	}

	return user;
};

// Hashing Plane Password
userSchema.pre('save', async function(next) {
	const user = this;

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

userSchema.post('save', async function() {
	const user = this;
	await user.populate('allergies');
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// TODO: TESTS
// TODO: Allergies should not be visible to everyone
