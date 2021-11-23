const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
	getAllProducts,
	addProduct,
	editProduct,
	deleteProduct,
	getProduct,
	verifyProduct
} = require('../controllers/product');

router.route('/').get(getAllProducts).post(auth, addProduct);
router.route('/verify/:id').patch(verifyProduct);
router.route('/:id').get(getProduct).delete(auth, deleteProduct).patch(auth, editProduct);

module.exports = router;

//TODO: Only owner / admin can remove!
