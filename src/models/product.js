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

productSchema.pre('find', function() {
	let product = this;
	product.populate({ path: 'allergies' }).populate({ path: 'owner', select: 'login' });
});

productSchema.pre('findOne', function() {
	let product = this;
	product.populate({ path: 'allergies' }).populate({ path: 'owner', select: 'login' });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
