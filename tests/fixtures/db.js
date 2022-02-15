const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Allergy = require('../../src/models/allergy');
const Product = require('../../src/models/product');
const Recipe = require('../../src/models/recipe');

const adminOneId = new mongoose.Types.ObjectId();
const adminOne = {
	_id: adminOneId,
	isAdmin: true,
	login: 'adminOne',
	email: 'adminOne@gmail.com',
	password: '56what!!',
	tokens: [
		{
			token: jwt.sign({ _id: adminOneId }, process.env.JWT_SECRET)
		}
	]
};

const doctorOneId = new mongoose.Types.ObjectId();
const doctorOne = {
	_id: doctorOneId,
	pwz: 'TESTPWZ',
	login: 'doctorOne',
	email: 'doctorOne@gmail.com',
	password: '56what!!',
	tokens: [
		{
			token: jwt.sign({ _id: doctorOneId }, process.env.JWT_SECRET)
		}
	]
};

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
	name: 'first allergy',
	shortName: '1AL'
};

const allergyTwo = {
	_id: new mongoose.Types.ObjectId(),
	name: 'Second allergy',
	shortName: '2AL'
};

const allergyThree = {
	_id: new mongoose.Types.ObjectId(),
	name: 'Third allergy',
	shortName: '3AL'
};

const productOneId = new mongoose.Types.ObjectId();
const productOne = {
	_id: productOneId,
	name: 'Product One',
	description: 'Product One Description',
	owner: userOne,
	allergies: [ allergyOne, allergyTwo ]
};

const productTwoId = new mongoose.Types.ObjectId();
const productTwo = {
	_id: productTwoId,
	name: 'Product Two',
	description: 'Product Two Description',
	owner: userOne,
	allergies: [ allergyTwo ]
};

const recipeOneId = new mongoose.Types.ObjectId();
const recipeOne = {
	_id: recipeOneId,
	name: 'Recipe One',
	description: 'Recipe One Description',
	preparation: [ 'Step 1: Description here', 'Step 2: Description here' ],
	owner: userOne,
	products: [
		{
			product: productOne,
			amount: '100 units'
		}
	]
};

const recipeTwo = {
	_id: new mongoose.Types.ObjectId(),
	name: 'Recipe Two',
	description: 'Recipe Two Description',
	preparation: [ 'Step 1: Description here', 'Step 2: Description here' ],
	owner: userTwo,
	products: [
		{
			product: productOne,
			amount: '101 kilos'
		},
		{
			product: productTwo,
			amount: '100 units'
		}
	]
};

const userThreeId = new mongoose.Types.ObjectId();
const userThree = {
	_id: userThreeId,
	login: 'UserThree',
	email: 'uThree@gmail.com',
	password: '56what!!',
	tokens: [
		{
			token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET)
		}
	],
	allergies: [ allergyOne, allergyTwo ]
};

const setupDatabase = async () => {
	// Clean test DB
	await User.deleteMany();
	await Allergy.deleteMany();
	await Product.deleteMany();
	await Recipe.deleteMany();

	// Save Data
	await new User(userOne).save();
	await new User(userTwo).save();
	await new User(userThree).save();
	await new User(adminOne).save();
	await new User(doctorOne).save();

	await new Allergy(allergyOne).save();
	await new Allergy(allergyTwo).save();
	await new Allergy(allergyThree).save();

	await new Product(productOne).save();
	await new Product(productTwo).save();

	await new Recipe(recipeOne).save();
	await new Recipe(recipeTwo).save();
};

module.exports = {
	adminOne,
	adminOneId,
	doctorOne,
	doctorOneId,
	userOneId,
	userOne,
	userTwo,
	allergyOne,
	allergyOneId,
	allergyTwo,
	productOne,
	productOneId,
	productTwo,
	recipeOne,
	recipeOneId,
	recipeTwo,
	setupDatabase
};
