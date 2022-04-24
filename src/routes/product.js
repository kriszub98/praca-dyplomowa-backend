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
	getAllProducts,
	addProduct,
	editProduct,
	deleteProduct,
	getProduct,
	verifyProduct,
	addPhoto,
	addPhotoBase64,
	getPhoto
} = require('../controllers/product');

router.route('/').get(getAllProducts).post(auth, addProduct);
router.route('/:id').get(getProduct).delete(auth, deleteProduct).patch(auth, editProduct);
router.route('/:id/verify').patch(auth, verifyProduct);
router.route('/:id/photo').get(getPhoto).post(auth, upload.single('photo'), addPhoto);
router.route('/:id/photoBase64').post(auth, addPhotoBase64);

module.exports = router;

//TODO: Only owner / admin can remove!
