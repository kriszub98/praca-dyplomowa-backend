const User = require('../models/user');

const getAllUsers = async (req, res) => {
	const users = await User.find({});
	//TODO: Add filtering, pagination and sorting
	return res.status(200).json({ users });
};

const getUserById = async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return res.status(404).json({ error: 'No user with that id' });
	}
	return res.status(200).json({ user });
};

const register = async (req, res) => {
	const user = new User(req.body);

	await user.save();
	const token = await user.generateAuthToken();
	return res.status(201).json({ user, token });
};

const login = async (req, res) => {
	let { email, password } = req.body;
	email = email.toLowerCase();
	const user = await User.findByCredentials(email, password);
	const token = await user.generateAuthToken();
	return res.status(200).json({ user, token });
};

const logout = async (req, res) => {
	req.user.tokens = req.user.tokens.filter((token) => {
		return token.token !== req.token;
	});
	await req.user.save();

	return res.status(200).json({ message: 'Logout successful' });
};

const logoutAll = async (req, res) => {
	req.user.tokens = [];
	await req.user.save();
	return res.status(200).json({ message: 'Logout successful' });
};

// TODO: Tylko admin
const deleteUser = async (req, res) => {
	const user = await User.findOneAndDelete({ _id: req.params.id });
	if (!user) {
		return res.status(404).json({ error: 'No user with that id' });
	}

	return res.status(200).json({ user });
};

const deleteMyAccount = async (req, res) => {
	const user = await User.findOneAndDelete({ _id: req.params.id });
	if (!user) {
		return res.status(404).json({ error: 'No user with that id' });
	}

	return res.status(200).json({ user });
};

const myAccount = async (req, res) => {
	return res.status(200).json({ user: req.user });
};

const editMyAccount = async (req, res) => {
	// Validate updating fields
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'login', 'email', 'password' ];
	const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidUpdate) return res.status(400).json({ error: 'Invalid updates!' });

	updates.forEach((update) => (req.user[update] = req.body[update]));

	await req.user.save();

	return res.status(200).json({ user: req.user });
};

module.exports = {
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
};
