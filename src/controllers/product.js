const Product = require('../models/product');
const sharp = require('sharp');
const { Buffer } = require('buffer');

const getAllProducts = async (req, res) => {
	const { name, sort, fields } = req.query;
	let queryObject = {};

	// Filtering
	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}
	let result = Product.find(queryObject);

	// Sorting
	if (sort) {
		const sortList = sort.split(',').join(' ');
		result = result.sort(sortList);
	} else {
		result = result.sort('createdAt');
	}

	// Choosing fields
	if (fields) {
		const fieldsList = fields.split(',').join(' ');
		result = result.select(fieldsList);
	}

	const products = await result;

	return res.status(200).json(products);
};

const addProduct = async (req, res) => {
	const product = new Product({ ...req.body, owner: req.user._id });
	await product.save();
	return res.status(201).json(product);
};

const editProduct = async (req, res) => {
	// Validate updating fields
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'name', 'description', 'photo' ];
	const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidUpdate) return res.status(400).json({ error: 'Podano niepoprawne dane' });

	const product = await Product.findById(req.params.id);

	// Check if product exists
	if (!product) {
		return res.status(404).json({ error: 'Produkt z tym id nie istnieje' });
	}

	// Apply Changes
	updates.forEach((update) => (product[update] = req.body[update]));
	await product.save();

	return res.status(200).json({ product });
};

const deleteProduct = async (req, res) => {
	const product = await Product.findById(req.params.id);

	// Check if product exists
	if (!product) {
		return res.status(404).json({ error: 'Produkt z tym id nie istnieje' });
	}

	// Check if user is permited to remove product
	// TODO: Or if user is Admin || Doctor
	if (!product.owner.equals(req.user._id)) {
		return res.status(401).json({ error: 'Tylko właściciel lub administrator może usunąć produkt' });
	}

	// Remove product
	await Product.deleteOne(product);

	return res.status(200).send({ message: 'Usunięto pomyślnie' });
};

const getProduct = async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({ error: 'Produkt z tym id nie istnieje' });
	}
	return res.status(200).json({ product });
};

const verifyProduct = async (req, res) => {
	const product = await Product.findById(req.params.id);

	// Check if product exists
	if (!product) {
		return res.status(404).json({ error: 'Produkt z tym id nie istnieje' });
	}

	// TODO: Check if user is Admin || Doctor
	// Check if user is permited to verify product

	// Verify the product
	product.validatedBy = req.user;
	await product.save();

	return res.status(200).send({ message: 'Weryfikacja zapisana' });
};

const addPhoto = async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({ error: 'Produkt z tym id nie istnieje' });
	}

	// TODO: Usun clg po skonczeniu
	console.log(req.file);

	const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
	product.photo = buffer;
	await product.save();
	return res.status(201).json(product);
};

const addPhotoBase64 = async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({ error: 'Produkt z tym id nie istnieje' });
	}

	let bufferPhoto = Buffer.from(req.body.photo, 'base64');

	const buffer = await sharp(bufferPhoto).resize({ width: 250, height: 250 }).toBuffer();
	product.photo = buffer;
	await product.save();
	return res.status(201).json(product);
};

const getPhoto = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product || !product.photo) {
			throw new Error();
		}
		res.set('Content-Type', 'image/png').send(product.photo);
	} catch (error) {
		res.status(404).send();
	}
};

module.exports = {
	getAllProducts,
	addProduct,
	editProduct,
	deleteProduct,
	getProduct,
	verifyProduct,
	addPhoto,
	addPhotoBase64,
	getPhoto
};

//TODO: Verify and add/remove allergy
