require('dotenv').config();
require('express-async-errors');

const connectDB = require('./db/connect');
const app = require('./app');

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
