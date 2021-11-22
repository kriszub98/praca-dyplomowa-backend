const express = require('express');
const app = express();

// Middlewares
const notFoundMiddleware = require('./middleware/not-found');
const errorMiddleware = require('./middleware/error-handler');

// Routers
const allergyRouter = require('./routes/allergy');

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Test Main Route');
});

app.use('/api/v1/allergies', allergyRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
