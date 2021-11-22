const errorHandlerMiddleware = async (err, req, res, next) => {
	// Record is not unique
	if (err.code === 11000) {
		return res.status(400).json({
			msg: 'Record already exist'
		});
	}

	console.log(err);
	return res.status(500).json({
		msg: 'Something went wrong, please try again'
	});
};

module.exports = errorHandlerMiddleware;
