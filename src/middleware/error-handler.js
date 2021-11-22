const errorHandlerMiddleware = async (err, req, res, next) => {
	// Record is not unique
	if (err.code === 11000) {
		return res.status(400).json({
			error: 'Record already exist'
		});
	}

	console.log(err);
	return res.status(500).json({
		error: err.message
	});
};

module.exports = errorHandlerMiddleware;
