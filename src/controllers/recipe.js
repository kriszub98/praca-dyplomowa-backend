const Recipe = require('../models/recipe');

const getAllRecipes = async (req, res) => {
	const { name, sort, fields } = req.query;
	let queryObject = {};

	// Filtering
	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}
	let result = Recipe.find(queryObject);

	// Sorting
	if (sort) {
		const sortList = sort.split(',').join(' ');
		result = result.sort(sortList);
	} else {
		result = result.sort('createdAt');
	}

	// Fields
	if (fields) {
		const fieldsList = fields.split(',').join(' ');
		result.select(fieldsList);
	}

	const recipes = await result;

	return res.status(200).json(recipes);
};

const getRecipe = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
	}

	return res.status(200).json(recipe);
};

const addRecipe = async (req, res) => {
	const recipe = new Recipe({ ...req.body, owner: req.user._id });
	await recipe.save();
	return res.status(201).json(recipe);
};

const editRecipe = async (req, res) => {
	// Validate updating fields
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'name', 'description', 'photo', 'preparation', 'products' ];
	const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidUpdate) return res.status(400).json({ error: 'Podano niepoprawne dane!' });

	const recipe = await Recipe.findById(req.params.id);

	// Check if recipe exists
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
	}

	// Apply Changes
	updates.forEach((update) => (recipe[update] = req.body[update]));
	await recipe.save();

	return res.status(200).json(recipe);
};

const deleteRecipe = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);

	// Check if recipe exists
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
	}

	// Check if user is permited to remove recipe
	// TODO: Or if user is Admin || Doctor
	if (!recipe.owner.equals(req.user._id)) {
		return res.status(401).json({ error: 'Tylko autor lub administrator może usunąć przepis' });
	}

	// Remove recipe
	await Recipe.deleteOne(recipe);

	return res.status(200).send({ message: 'Usunięto pomyślnie' });
};

const verifyRecipe = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);

	// Check if recipe exists
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
	}

	recipe.validatedBy = req.user;
	await recipe.save();

	return res.status(200).json(recipe);
};

// Favourites
const getFavouriteRecipes = async (req, res) => {
	const { name, sort } = req.query;
	let sortList = '';
	let queryObject = {};

	//Filtering
	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}

	// Sorting
	if (sort) {
		sortList = sort.split(',').join(' ');
	}

	await req.user.populate({
		path: 'favouriteRecipes',
		match: queryObject,
		options: {
			sort: sortList
		}
	});

	return res.status(200).json(req.user);
};

const addToFavourite = async () => {
	const recipe = await Recipe.findById(req.params.id);

	// Check if recipe exists
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
	}
	req.user.favouriteRecipes.push(recipe);

	await req.user.save();
	return res.status(200).json(req.user);
};

module.exports = {
	getAllRecipes,
	getRecipe,
	addRecipe,
	editRecipe,
	deleteRecipe,
	verifyRecipe,
	getFavouriteRecipes
};

//TODO: Verify and add/remove allergy
