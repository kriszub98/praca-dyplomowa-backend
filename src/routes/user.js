const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
	getAllUsers,
	register,
	login,
	logout,
	logoutAll,
	getUserById,
	deleteUser,
	myAccount,
	editMyAccount,
	deleteMyAccount
} = require('../controllers/user');

router.route('/').post(register).get(getAllUsers);
router.route('/login').post(login);
router.route('/logout').post(auth, logout);
router.route('/logoutAll').post(auth, logoutAll);
router.route('/me').get(auth, myAccount).delete(auth, deleteMyAccount).patch(auth, editMyAccount);
router.route('/:id').get(getUserById).delete(deleteUser);

module.exports = router;
