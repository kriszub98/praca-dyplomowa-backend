const express = require('express');
const app = express();

// Middlewares
const notFoundMiddleware = require('./middleware/not-found');
const errorMiddleware = require('./middleware/error-handler');

// Routers
const allergyRouter = require('./routes/allergy');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const recipeRouter = require('./routes/recipe');

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Test Main Route');
});

app.use('/api/v1/allergies', allergyRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/recipes', recipeRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
