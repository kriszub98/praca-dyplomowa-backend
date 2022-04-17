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
					type: String,
					required: true
				}
			}
		],
		comments: [
			{
				author: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'User'
				},
				content: {
					type: String,
					required: true
				},
				createdAt: Date
			}
		],
		ratings: [
			{
				author: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'User'
				},
				score: {
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

recipeSchema.pre('find', function() {
	let recipe = this;
	recipe
		.populate({
			path: 'products.product',
			select: [ '_id', 'name', 'description', 'owner', 'allergies', 'createdAt', 'hasPhoto', 'id', 'validatedBy' ]
		})
		.populate({ path: 'owner', select: 'login' })
		.populate({ path: 'validatedBy', select: 'login' });
});

recipeSchema.pre('findOne', function() {
	let recipe = this;
	recipe
		.populate({
			path: 'products.product',
			select: [ '_id', 'name', 'description', 'owner', 'allergies', 'createdAt', 'hasPhoto', 'id', 'validatedBy' ]
		})
		.populate({ path: 'owner', select: 'login' })
		.populate({ path: 'validatedBy', select: 'login' });
});

recipeSchema.post('save', async function() {
	let recipe = this;
	await recipe.populate({
		path: 'products.product',
		select: [ '_id', 'name', 'description', 'owner', 'allergies', 'createdAt', 'hasPhoto', 'id', 'validatedBy' ]
	});
});

recipeSchema.virtual('hasPhoto').get(function() {
	let recipe = this;
	return recipe.photo ? true : false;
});

recipeSchema.virtual('allergies').get(function() {
	let allergiesArray = new Array();
	let productsArray = this.products;

	productsArray.forEach(({ product }) => {
		product.allergies.forEach((allergy) => {
			// Check if Allergy is already in Array
			if (!allergiesArray.some((a) => a._id === allergy._id)) {
				return allergiesArray.push(allergy);
			}
		});
	});

	return allergiesArray;
});

recipeSchema.virtual('averageRating').get(function() {
	let recipe = this;
	let average =
		recipe.ratings.reduce(function(sum, rating) {
			return sum + rating.score;
		}, 0) / recipe.ratings.length;
	return average;
});

recipeSchema.virtual('ratingVoteAmount').get(function() {
	let recipe = this;
	let amount = recipe.ratings.length;
	return amount;
});

recipeSchema.methods.toJSON = function() {
	const recipe = this;
	const recipeObject = recipe.toObject({ virtuals: true });

	delete recipeObject.photo;

	return recipeObject;
};

recipeSchema.set('toObject', { virtuals: true });
recipeSchema.set('toJSON', { virtuals: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

// TODO: If i need isValidated i can make it virtual field and use return validetedBy !== null
// Allergies is also virtual taken from products, USE SET
