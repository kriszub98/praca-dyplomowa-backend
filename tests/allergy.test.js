const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/db/connect');
const Allergy = require('../src/models/allergy');
const { allergyOne, allergyOneId, setupDatabase } = require('./fixtures/db');
connectDB(process.env.MONGO_URI);

beforeEach(setupDatabase);

test('Should fetch 3 allergies', async () => {
	const response = await request(app).get('/api/v1/allergies').send().expect(200);
	expect(response.body.length).toBe(3);
});

test('Should return allergy with the name of first allergy', async () => {
	const response = await request(app).get(`/api/v1/allergies/${allergyOneId}`).send().expect(200);

	// Assert that allergy exists
	expect(response.body.allergy).not.toBeNull();

	// Assert that data is correct
	expect(response.body.allergy).toMatchObject(allergyOne);
});

test('Should add new allergy', async () => {
	const response = await request(app)
		.post('/api/v1/allergies')
		.send({
			name: 'Nabiał',
			shortName: 'NAB'
		})
		.expect(201);

	// Assert that db was changed properly
	const allergy = await Allergy.findById(response.body.allergy._id);
	expect(allergy).not.toBeNull();

	// Assert allergy data is correct(name is lowercase and name matches pattern)
	expect(allergy).toMatchObject({
		name: 'nabiał',
		shortName: 'NAB'
	});
});

test("Shouldn't add allergy with existing name", async () => {
	const response = await request(app)
		.post('/api/v1/allergies')
		.send({
			name: 'first allergy',
			shortName: 'fal'
		})
		.expect(400);

	// Check for valid error message
	expect(response.body.error).toBe('Alergia już istnieje');
});

test('Should edit allergy with correct data and id', async () => {
	const response = await request(app)
		.patch(`/api/v1/allergies/${allergyOneId}`)
		.send({
			name: 'not first allergy'
		})
		.expect(200);

	// Assert that response returned edited allergy
	expect(response.body).toMatchObject({
		allergy: {
			name: 'not first allergy'
		}
	});

	// Assert change in DB
	const allergy = await Allergy.findById(allergyOneId);
	expect(allergy).not.toBeNull();
	expect(allergy).toMatchObject({
		name: 'not first allergy'
	});
});

test("Shouldn't edit allergy with incorrect id", async () => {
	const response = await request(app)
		.patch(`/api/v1/allergies/000000000000000000000000`)
		.send({
			name: 'not first allergy'
		})
		.expect(404);
});

test("Shouldn't edit allergy with incorrect data", async () => {
	// Empty object
	let response = await request(app).patch(`/api/v1/allergies/${allergyOneId}`).send({}).expect(400);
	expect(response.body.error).toBe('Empty Values!');

	// Invalid value
	response = await request(app).patch(`/api/v1/allergies/${allergyOneId}`).send({ randomField: 'test' }).expect(400);
	expect(response.body.error).toBe('Invalid Updates!');

	// Name that exists
	response = await request(app)
		.patch(`/api/v1/allergies/${allergyOneId}`)
		.send({ name: 'second allergy' })
		.expect(400);
	expect(response.body.error).toBe('Allergy name already exists');
});

test('Should remove allergy and return its data', async () => {
	let response = await request(app).delete(`/api/v1/allergies/${allergyOneId}`).expect(200);
	expect(response.body.allergy).toMatchObject(allergyOne);

	// Assert DB change
	const allergy = await Allergy.findById(allergyOneId);
	expect(allergy).toBeNull();

	// Check if can remove deleted object and if displays proper message
	response = await request(app).delete(`/api/v1/allergies/${allergyOneId}`).expect(404);
	expect(response.body.error).toBe('No allergy with that id');
});

// TODO: Only authorized and role is doctor can add
// TODO: Only authorized and role is doctor can edit
// TODO: Only authorized and role is doctor can remove
