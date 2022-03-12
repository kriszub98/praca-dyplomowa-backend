const Recipe = require('../models/recipe');

const getAllRecipes = async (req, res) => {
	const recipes = await Recipe.find({});
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

const verifyRecipe = async (req, res) => {};

// TODO: SPRAWDZ TE KOMENTY?! const deleteProduct = async (req, res) => {
// 	const product = await Product.findById(req.params.id);

// 	// Check if product exists
// 	if (!product) {
// 		return res.status(404).json({ error: 'Product with that id does not exist' });
// 	}

// 	// Check if user is permited to remove product
// 	// TODO: Or if user is Admin || Doctor
// 	if (!product.owner.equals(req.user._id)) {
// 		return res.status(401).json({ error: 'Only owner can remove that product' });
// 	}

// 	// Remove product
// 	await Product.deleteOne(product);

// 	return res.status(200).send({ message: 'Successfully removed' });
// };

// const getProduct = async (req, res) => {
// 	const product = await Product.findById(req.params.id);
// 	if (!product) {
// 		return res.status(404).json({ error: 'Product with that id does not exist' });
// 	}
// 	return res.status(200).json({ product });
// };

// const verifyProduct = async (req, res) => {
// 	const product = await Product.findById(req.params.id);

// 	// Check if product exists
// 	if (!product) {
// 		return res.status(404).json({ error: 'Product with that id does not exist' });
// 	}

// 	// TODO: Check if user is Admin || Doctor
// 	// Check if user is permited to verify product

// 	// Verify the product
// 	product.validatedBy = req.user;
// 	await product.save();

// 	return res.status(200).send({ message: 'Successfully verified' });
// };

module.exports = {
	getAllRecipes,
	getRecipe,
	addRecipe,
	editRecipe,
	deleteRecipe,
	verifyRecipe
};

//TODO: Verify and add/remove allergy
