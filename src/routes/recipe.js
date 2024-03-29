const express = require('express');
const router = express.Router();
const multer = require('multer');
// For image upload
const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Zdjęcie musi być formatu jpg, jpeg lub png!'));
		}
		cb(undefined, true);
	}
});

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
	addRating,
	addPhoto,
	addPhotoBase64,
	getPhoto,
	switchFavourite,
	getMyRecipes
} = require('../controllers/recipe');

router.route('/').get(getAllRecipes).post(auth, addRecipe);
router.route('/filtered').post(getFilteredRecipes);
router.route('/myRecipes').post(auth, getMyRecipes);
router.route('/favourites').post(auth, getFavouriteRecipes);
router.route('/:id/verify').patch(auth, verifyRecipe);
router.route('/:id').get(getRecipe).delete(auth, deleteRecipe).patch(auth, editRecipe);
router.route('/:id/comments').post(auth, addComment);
router.route('/:id/favourite').patch(auth, switchFavourite);
router.route('/:id/removeComment').post(auth, deleteComment); // TODO: Change
router.route('/:id/ratings').post(auth, addRating);
router.route('/:id/photo').get(getPhoto).post(auth, upload.single('photo'), addPhoto);
router.route('/:id/photoBase64').post(auth, addPhotoBase64);

module.exports = router;

//TODO: Only owner / admin can remove!
