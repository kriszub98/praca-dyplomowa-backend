const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/db/connect');
const Product = require('../src/models/product');

// Initial data
const {
	allergyOne,
	allergyOneId,
	setupDatabase,
	userOne,
	userOneId,
	userTwo,
	allergyTwo,
	productOne,
	productOneId,
	productTwo
} = require('./fixtures/db');

connectDB(process.env.MONGO_URI);
beforeEach(setupDatabase);

test('Should add new product', async () => {
	const response = await request(app)
		.post('/api/v1/products')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Testing Product',
			description: 'Product added for testing purpose',
			allergies: [ allergyOne, allergyTwo ]
		})
		.expect(201);

	// Assert that the product was added
	const product = await Product.findById(response.body._id);
	expect(product).not.toBeNull();

	// Assert that product data is correct
	expect(response.body).toMatchObject({
		name: 'Testing Product',
		description: 'Product added for testing purpose',
		allergies: [ allergyOne._id, allergyTwo._id ]
	});
});

test("Shouldn't add product if user is not logged in", async () => {
	await request(app)
		.post('/api/v1/products')
		.send({
			name: 'Testing Product',
			description: "Product wasn't added"
		})
		.expect(401);
});

test("Shouldn't update product if it doesn't exist", async () => {
	const response = await request(app)
		.patch('/api/v1/products/000000000000000000000000')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Invalid Update'
		})
		.expect(404);

	// Check if response contains showable error
	expect(response.body).toMatchObject({
		error: 'Product with that id does not exist'
	});
});

test("Shouldn't update product if updates are incorrect", async () => {
	const response = await request(app)
		.patch(`/api/v1/products/${productOneId}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Field Updated',
			invalid: 'Invalid Prop'
		})
		.expect(400);

	// Check if response contains showable error
	expect(response.body).toMatchObject({
		error: 'Invalid updates!'
	});
});

test("Shouldn't update product if user is not logged in", async () => {
	await request(app)
		.patch(`/api/v1/products/${productOneId}`)
		.send({
			name: 'Invalid Update'
		})
		.expect(401);
});

test("Shouldn't remove product if it doesn't exist. Should return 404", async () => {
	const response = await request(app)
		.delete('/api/v1/products/000000000000000000000000')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(404);

	// Check if response contains showable error
	expect(response.body).toMatchObject({
		error: 'Product with that id does not exist'
	});
});

test("Shouldn't remove product if logged user is not owner of the product", async () => {
	const response = await request(app)
		.delete(`/api/v1/products/${productOneId}`)
		.set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
		.expect(401);

	// Check if response contains showable error
	expect(response.body).toMatchObject({
		error: 'Only owner can remove that product'
	});
});

test('Should remove product', async () => {
	const response = await request(app)
		.delete(`/api/v1/products/${productOneId}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200);

	// Check if response contains showable message
	expect(response.body).toMatchObject({ message: 'Successfully removed' });

	// Check if product was removed
	const product = await Product.findById(productOneId);
	expect(product).toBeNull();
});

test("Shouldn't verify product if it doesn't exist. Should return 404", async () => {
	const response = await request(app)
		.patch('/api/v1/products/verify/000000000000000000000000')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(404);

	// Check if response contains showable error
	expect(response.body).toMatchObject({
		error: 'Product with that id does not exist'
	});
});

//TODO: Shouldnt verify is user is not doctor

test('Should verify the product', async () => {
	const response = await request(app)
		.patch(`/api/v1/products/verify/${productOneId}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200);

	// Check if response contains showable message
	expect(response.body).toMatchObject({ message: 'Successfully verified' });

	// Check if product was validated
	const product = await Product.findById(productOneId);
	expect(product.validatedBy).toStrictEqual(userOneId);
});
