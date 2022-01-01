const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		description: {
			type: String,
			trim: true
		},
		photo: {
			type: Buffer
		},
		validatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		allergies: [
			{
				type: mongoose.Schema.Types.ObjectId,
				required: true,
				ref: 'Allergy'
			}
		]
	},
	{
		timestamps: true
	}
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
