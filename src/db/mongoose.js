const mongoose = require('mongoose');

mongoose.connect('MONGODB_URL=mongodb://127.0.0.1:27017/appsik-api', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
