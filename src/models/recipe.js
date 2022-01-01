const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
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
		preparation: [
			{
				type: String,
				trim: true
			}
		],
		validatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'Product'
				},
				amount: {
					type: Number,
					required: true
				}
			}
		]
	},
	{
		timestamps: true
	}
);

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

// If i need isValidated i can make it virtual field and use return validetedBy !== null
// Allergies is also virtual taken from products, USE SET
