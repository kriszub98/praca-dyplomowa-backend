require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const connectDB = require('./db/connect');

// Middlewares
const notFoundMiddleware = require('./middleware/not-found');
const errorMiddleware = require('./middleware/error-handler');

app.use(express.json());
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Routers

const port = process.env.PORT || 3000;
const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		app.listen(port, console.log(`SERVER IS LISTENING ON PORT ${port}`));
	} catch (error) {
		console.log(error);
	}
};

start();
