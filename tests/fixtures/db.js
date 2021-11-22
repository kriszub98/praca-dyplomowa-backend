const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Allergy = require('../../src/models/allergy');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
	_id: userOneId,
	login: 'UserOne',
	email: 'uone@gmail.com',
	password: '56what!!',
	tokens: [
		{
			token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
		}
	]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
	_id: userTwoId,
	login: 'UserTwo',
	email: 'utwo@gmail.com',
	password: '56what!!',
	tokens: [
		{
			token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
		}
	]
};

const allergyOneId = new mongoose.Types.ObjectId();
const allergyOne = {
	_id: allergyOneId,
	name: 'first allergy'
};

const allergyTwo = {
	_id: new mongoose.Types.ObjectId(),
	name: 'Second allergy'
};

const allergyThree = {
	_id: new mongoose.Types.ObjectId(),
	name: 'Third allergy'
};

const setupDatabase = async () => {
	// Clean test DB
	await User.deleteMany();
	await Allergy.deleteMany();

	// Save Data
	await new User(userOne).save();
	await new User(userTwo).save();

	await new Allergy(allergyOne).save();
	await new Allergy(allergyTwo).save();
	await new Allergy(allergyThree).save();
};

module.exports = {
	userOneId,
	userOne,
	userTwo,
	allergyOne,
	allergyOneId,
	setupDatabase
};
