const Recipe = require('../models/recipe');
const mongoose = require('mongoose');
const sharp = require('sharp');

const getAllRecipes = async (req, res) => {
	const { name, sort, validated } = req.query;
	let queryObject = {};

	//Filtering
	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}

	if (validated === 'true') {
		queryObject.validatedBy = { $ne: undefined };
	} else if (validated === 'false') {
		queryObject.validatedBy = undefined;
	}

	let result = Recipe.find(queryObject);

	// Sorting
	if (sort) {
		const sortList = sort.split(',').join(' ');
		result = result.sort(sortList);
	} else {
		result = result.sort('createdAt');
	}

	const recipes = await result;
	return res.status(200).json(recipes);
};

const getFilteredRecipes = async (req, res) => {
	let { name, allergies, sort } = req.body;
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

	let recipes = await result;

	// Filtering Allergies
	if (allergies && allergies.length > 0 && recipes && recipes.length > 0) {
		recipes = recipes.filter((recipe) => {
			// Check if recipe has at least one of filtered allergies
			let hasOneOfAllergies = recipe.allergies.some((recipeAllergy) => {
				// Check if this recipeAllergy is inside chosenAllergies
				let isAllergyInFilteredAllergies = allergies.some((allergy) => allergy.name === recipeAllergy.name);
				return isAllergyInFilteredAllergies;
			});

			let canEat = !hasOneOfAllergies;
			return canEat;
		});
	}

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

const getMyRecipes = async (req, res) => {
	let { name, allergies, sort } = req.body;
	let queryObject = {};

	// Filtering
	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}

	queryObject.owner = req.user;

	let result = Recipe.find(queryObject);

	// Sorting
	if (sort) {
		const sortList = sort.split(',').join(' ');
		result = result.sort(sortList);
	} else {
		result = result.sort('createdAt');
	}

	let recipes = await result;

	// Filtering Allergies
	if (allergies && allergies.length > 0 && recipes && recipes.length > 0) {
		recipes = recipes.filter((recipe) => {
			// Check if recipe has at least one of filtered allergies
			let hasOneOfAllergies = recipe.allergies.some((recipeAllergy) => {
				// Check if this recipeAllergy is inside chosenAllergies
				let isAllergyInFilteredAllergies = allergies.some((allergy) => allergy.name === recipeAllergy.name);
				return isAllergyInFilteredAllergies;
			});

			let canEat = !hasOneOfAllergies;
			return canEat;
		});
	}

	return res.status(200).json(recipes);
};

// Favourites
const getFavouriteRecipes = async (req, res) => {
	const { name, sort } = req.body;
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

const switchFavourite = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);

	// Check if recipe exists
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
	}

	let user = req.user;

	// Check if already in favorite
	let isFavourite = user.favouriteRecipes.some((recipeId) => recipe._id.equals(recipeId));

	// If in Fav remove it, else add it
	if (isFavourite) {
		user.favouriteRecipes = user.favouriteRecipes.filter((recipeId) => !recipe._id.equals(recipeId));
	} else {
		user.favouriteRecipes.push(recipe);
	}

	await user.save();
	return res.status(200).json(user);
};

const addComment = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);
	if (!recipe) {
		return res.status(404).json({ error: 'Przepis z tym id nie istnieje' });
	}

	const { content } = req.body;
	if (!content) {
		return res.status(400).json({ error: 'Treść komentarza nie może być pusta' });
	}

	recipe.comments.push({
		author: req.user._id,
		content,
		createdAt: Date(0)
	});

	// Save comment
	await recipe.save();

	return res.status(200).json(recipe);
};

const deleteComment = async (req, res) => {
	const { comment } = req.body;
	if (!comment) {
		return res.status(400).json({ error: 'Niepoprawne żądanie' });
	}

	const recipe = await Recipe.findById(req.params.id);
	if (!recipe) {
		return res.status(404).json({ error: 'Przepis z tym id nie istnieje' });
	}

	recipe.comments = recipe.comments.filter((c) => !c._id.equals(comment._id));
	await recipe.save();

	return res.status(200).json(recipe);
};

const addRating = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);
	if (!recipe) {
		return res.status(404).json({ error: 'Przepis z tym id nie istnieje' });
	}

	const { score } = req.body;

	if (!score) {
		return res.status(400).json({ error: 'Należy podać ocenę' });
	}

	// Delete previous score if it exists
	recipe.ratings = recipe.ratings.filter((r) => !r.author.equals(req.user._id));

	recipe.ratings.push({
		author: req.user._id,
		score,
		createdAt: Date(0)
	});

	// Save comment
	await recipe.save();

	return res.status(200).json(recipe);
};

const addPhoto = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);
	if (!recipe) {
		return res.status(404).json({ error: 'Przepis z tym id nie istnieje' });
	}

	const buffer = await sharp(req.file.buffer)
		.resize({ width: 250, height: 250, fit: sharp.fit.inside })
		.png()
		.toBuffer();
	recipe.photo = buffer;
	await recipe.save();
	return res.status(201).json(recipe);
};

const addPhotoBase64 = async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);
	if (!recipe) {
		return res.status(404).json({ error: 'Przepis z tym id nie istnieje' });
	}

	let bufferPhoto = Buffer.from(req.body.photo, 'base64');

	const buffer = await sharp(bufferPhoto).resize({ width: 250, height: 250 }).toBuffer();
	recipe.photo = buffer;
	await recipe.save();
	return res.status(201).json(recipe);
};

const getPhoto = async (req, res) => {
	try {
		const recipe = await Recipe.findById(req.params.id);
		if (!recipe || !recipe.photo) {
			throw new Error();
		}
		res.set('Content-Type', 'image/png').send(recipe.photo);
	} catch (error) {
		res.status(404).send();
	}
};

module.exports = {
	getAllRecipes,
	getRecipe,
	addRecipe,
	editRecipe,
	deleteRecipe,
	verifyRecipe,
	getFavouriteRecipes,
	getFilteredRecipes,
	addComment,
	deleteComment,
	addRating,
	switchFavourite,
	getPhoto,
	addPhoto,
	addPhotoBase64,
	getMyRecipes
};

//TODO: Verify and add/remove allergy
