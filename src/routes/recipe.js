const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
	getAllRecipes,
	addRecipe,
	editRecipe,
	deleteRecipe,
	getRecipe,
	verifyRecipe
} = require('../controllers/recipe');

router.route('/').get(getAllRecipes).post(auth, addRecipe);
router.route('/verify/:id').patch(auth, verifyRecipe);
router.route('/:id').get(getRecipe).delete(auth, deleteRecipe).patch(auth, editRecipe);

module.exports = router;

//TODO: Only owner / admin can remove!
