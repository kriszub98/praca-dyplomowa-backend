const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/db/connect');
const Recipe = require('../src/models/recipe');

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
	productTwo,
	recipeOne,
	recipeOneId,
	recipeTwo
} = require('./fixtures/db');

connectDB(process.env.MONGO_URI);
beforeEach(setupDatabase);

test('Should return 2 recipes', async () => {
	const response = await request(app).get('/api/v1/recipes').send().expect(200);

	// Check if resposne contains 2 recipes
	expect(response.body.length).toBe(2);
});

test("Shouldn't return recipe if it doens't exist. Should return 404", async () => {
	const response = await request(app).get(`/api/v1/recipes/000000000000000000000000`).send().expect(404);

	//Check if response contains error message
	expect(response.body).toMatchObject({ error: 'Recipe with that id does not exist' });
});

test('Should return recipe one', async () => {
	const response = await request(app).get(`/api/v1/recipes/${recipeOneId}`).send().expect(200);

	//Check if response contains recipe
	expect(response.body).not.toBeNull();
	expect(response.body).toMatchObject({
		_id: recipeOneId
	});
});

test("Shouldn't add recipe if user is not logged in", async () => {
	await request(app)
		.post('/api/v1/recipes')
		.send({
			name: 'Testing Recipe',
			description: "Recipe wasn't added"
		})
		.expect(401);
});

test('Should add new recipe', async () => {
	const testRecipe = {
		name: 'Testing Recipe',
		description: 'Recipe added for testing purpose',
		preparation: [ 'Step 1: Description here', 'Step 2: Description here' ],
		products: [
			{
				product: productOne,
				amount: '101 kilos'
			}
		]
	};

	const response = await request(app)
		.post('/api/v1/recipes')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send(testRecipe)
		.expect(201);

	// Assert that the product was added
	const recipe = await Recipe.findById(response.body._id);
	expect(recipe).not.toBeNull();

	// Assert that product data is correct
	expect(response.body).toMatchObject({ name: testRecipe.name, description: testRecipe.description });
});

test("Shouldn't update recipe if it doesn't exist", async () => {
	const response = await request(app)
		.patch('/api/v1/recipes/000000000000000000000000')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Invalid Update'
		})
		.expect(404);

	// Check if response contains showable error
	expect(response.body).toMatchObject({
		error: 'Recipe with that id does not exist'
	});
});

test("Shouldn't update recipe if updates are incorrect", async () => {
	const response = await request(app)
		.patch(`/api/v1/recipes/${recipeOneId}`)
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

test("Shouldn't update recipe if user is not logged in", async () => {
	await request(app)
		.patch(`/api/v1/recipes/${recipeOneId}`)
		.send({
			name: 'Invalid Update'
		})
		.expect(401);
});

test('Should update recipe', async () => {
	const response = await request(app)
		.patch(`/api/v1/recipes/${recipeOneId}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: 'Valid Update',
			preparation: [ 'Step 1: Description here', 'Step 2: Description here', 'Step 3: Description here' ],
			products: [
				{
					product: productOne,
					amount: '100 kilos'
				},
				{
					product: productTwo,
					amount: '100 units'
				}
			]
		})
		.expect(200);

	// Check if changes applied
	const updatedRecipe = await Recipe.findById(recipeOneId);
	expect(updatedRecipe).toMatchObject({
		_id: recipeOneId,
		name: 'Valid Update',
		preparation: [ 'Step 1: Description here', 'Step 2: Description here', 'Step 3: Description here' ],
		products: [
			{
				product: productOne._id,
				amount: '100 kilos'
			},
			{
				product: productTwo._id,
				amount: '100 units'
			}
		]
	});
});

test("Shouldn't remove recipe if it doesn't exist. Should return 404", async () => {
	const response = await request(app)
		.delete('/api/v1/recipes/000000000000000000000000')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(404);

	// Check if response contains showable error
	expect(response.body).toMatchObject({
		error: 'Recipe with that id does not exist'
	});
});

test('Should remove recipe', async () => {
	const response = await request(app)
		.delete(`/api/v1/recipes/${recipeOneId}`)
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200);

	// Check if response contains showable message
	expect(response.body).toMatchObject({ message: 'Successfully removed' });

	// Check if product was removed
	const recipe = await Recipe.findById(recipeOneId);
	expect(recipe).toBeNull();
});
