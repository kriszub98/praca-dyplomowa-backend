const Recipe = require('../models/recipe');
const mongoose = require('mongoose');

const getAllRecipes = async (req, res) => {
	const { name, sort } = req.query;
	let { allergies } = req.body;
	let queryObject = {};

	//Filtering
	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}

	// If query containes allergies
	if (allergies) {
		allergies = allergies.map((allergyId) => {
			return mongoose.Types.ObjectId(allergyId);
		});
		let result = Recipe.aggregate([
			// Join Products and filter allergies
			{
				$lookup: {
					from: 'products',
					localField: 'products.product',
					foreignField: '_id',
					as: 'zlaczenie',
					let: {
						zlaczenie: '$zlaczenie'
					},
					pipeline: [
						{
							$match: {
								allergies: { $nin: allergies },
								$expr: { in: [ '$_id', '$$zlaczenie._id' ] }
							}
						}
					]
				}
			},
			// Remove empty records
			{
				$unwind: {
					path: '$zlaczenie'
				}
			},
			// Query names
			{
				$match: queryObject
			}
		]);

		// Sorting
		if (sort) {
			const sortList = sort.split(',').join(' ');
			result = result.sort(sortList);
		} else {
			result = result.sort('createdAt');
		}

		const filteredRecipes = await result;
		let recipes = await Recipe.populate(filteredRecipes, [
			{ path: 'products.product' },
			{ path: 'owner', select: 'login' }
		]);

		// Add virtual fields
		if (recipes) {
			recipes = recipes.map((r) => new Recipe(r).toJSON());
		}

		return res.status(200).json(recipes);
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

	//Filtering
	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}

	// If query containes allergies
	if (allergies) {
		allergies = allergies.map((a) => mongoose.Types.ObjectId(a._id));

		let result = Recipe.aggregate([
			// Join Products and filter allergies
			{
				$lookup: {
					from: 'products',
					localField: 'products.product',
					foreignField: '_id',
					as: 'zlaczenie',
					let: {
						zlaczenie: '$zlaczenie'
					},
					pipeline: [
						{
							$match: {
								allergies: { $nin: allergies },
								$expr: { in: [ '$_id', '$$zlaczenie._id' ] }
							}
						}
					]
				}
			},
			// Remove empty records
			{
				$unwind: {
					path: '$zlaczenie'
				}
			},
			// Query names
			{
				$match: queryObject
			}
		]);

		// Sorting
		if (sort) {
			const sortList = sort.split(',').join(' ');
			result = result.sort(sortList);
		} else {
			result = result.sort('createdAt');
		}

		const filteredRecipes = await result;
		let recipes = await Recipe.populate(filteredRecipes, [
			{ path: 'products.product' },
			{ path: 'owner', select: 'login' }
		]);

		// Add virtual fields
		if (recipes) {
			recipes = recipes.map((r) => new Recipe(r).toJSON());
		}

		return res.status(200).json(recipes);
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

const addComment = async (req, res) => {
	// Route is: POST /recipes/comments
	// I get: {recipeId, content} i user z autha
	// Comment is {content and author}

	const { recipeId, content } = req.body;
	if (!recipeId) {
		return res.status(400).json({ error: 'Żądanie nieprawidłowe' });
	}

	if (!content) {
		return res.status(400).json({ error: 'Treść komentarza nie może być pusta' });
	}

	const recipe = await Recipe.findById(recipeId);
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
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
	// Route is: DELETE /recipes/comments
	// I get: {recipeId, commentId}

	const { recipeId, commentId } = req.body;
	if (!recipeId || !commentId) {
		return res.status(400).json({ error: 'Niepoprawne żądanie' });
	}

	const recipe = await Recipe.findById(recipeId);
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
	}

	recipe.comments = recipe.comments.filter((c) => !c._id.equals(commentId));
	await recipe.save();

	return res.status(200).json(recipe);
};

const addRating = async (req, res) => {
	// Route is: POST /recipes/ratings
	// I get: {recipeId, score} i user z autha
	// Comment is {score, author}
	// TODO: Nie można 2 razy przez tego samego usera

	const { recipeId, score } = req.body;
	if (!recipeId) {
		return res.status(400).json({ error: 'Żądanie nieprawidłowe' });
	}

	if (!score) {
		return res.status(400).json({ error: 'Należy podać ocenę' });
	}

	const recipe = await Recipe.findById(recipeId);
	if (!recipe) {
		return res.status(404).json({ error: 'Brak przepisu z tym id' });
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
	addRating
};

//TODO: Verify and add/remove allergy
