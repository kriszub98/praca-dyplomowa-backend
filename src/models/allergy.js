const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		unique: true
	},
	shortName: {
		type: String,
		required: true,
		trim: true,
		unique: true
	}
});

const Allergy = mongoose.model('Allergy', allergySchema);

module.exports = Allergy;

// TODO: IF CROSS ALLERGY MAYBE I CAN STORE THEM HERE INSIDE CROSS ALLERGIES []
