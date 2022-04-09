const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
	getAllRecipes,
	addRecipe,
	addComment,
	editRecipe,
	deleteRecipe,
	deleteComment,
	getRecipe,
	verifyRecipe,
	getFavouriteRecipes,
	getFilteredRecipes,
	addRating
} = require('../controllers/recipe');

router.route('/').get(getAllRecipes).post(auth, addRecipe);
router.route('/filtered').post(getFilteredRecipes);
router.route('/favourites').get(auth, getFavouriteRecipes);
router.route('/verify/:id').patch(auth, verifyRecipe);
router.route('/:id').get(getRecipe).delete(auth, deleteRecipe).patch(auth, editRecipe);
router.route('/addComment').post(auth, addComment);
router.route('/removeComment').post(auth, deleteComment);
router.route('/ratings').post(auth, addRating);

module.exports = router;

//TODO: Only owner / admin can remove!
