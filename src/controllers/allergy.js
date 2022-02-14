const Allergy = require('../models/allergy');

const getAllAllergies = async (req, res) => {
	const allergies = await Allergy.find({});
	return res.status(200).json(allergies);
};

const getAllergy = async (req, res) => {
	const allergy = await Allergy.findById(req.params.id);
	if (!allergy) {
		return res.status(404).json({ error: 'No allergy with that id' });
	}
	return res.status(200).json({ allergy });
};

const addAllergy = async (req, res) => {
	try {
		const allergy = new Allergy({ name: req.body.name });
		await allergy.save();
		return res.status(201).json({ allergy });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ error: 'Alergia już istnieje' });
		}
	}
};

const editAllergy = async (req, res) => {
	// Check if update is possible
	const updates = Object.keys(req.body);
	const allowedUpdates = [ 'name' ];

	const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
	if (!isValidUpdate) return res.status(400).json({ error: 'Invalid Updates!' });

	if (!req.body.name) return res.status(400).json({ error: 'Empty Values!' });

	// Check if task exists
	const allergy = await Allergy.findOne({ _id: req.params.id });
	if (!allergy) {
		return res.status(404).json({ error: 'No allergy with that id' });
	}

	//Update Task
	updates.forEach((update) => (allergy[update] = req.body[update]));

	try {
		await allergy.save();
		return res.status(200).json({ allergy });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ error: 'Allergy name already exists' });
		}
	}
};

const removeAllergy = async (req, res) => {
	const allergy = await Allergy.findOneAndDelete({ _id: req.params.id });

	return allergy ? res.status(200).json({ allergy }) : res.status(404).json({ error: 'No allergy with that id' });
};

module.exports = { getAllAllergies, addAllergy, getAllergy, editAllergy, removeAllergy };
