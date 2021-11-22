const express = require('express');
const router = express.Router();

const { getAllAllergies, getAllergy, addAllergy, editAllergy, removeAllergy } = require('../controllers/allergy');

router.route('/').get(getAllAllergies).post(addAllergy);
router.route('/:id').get(getAllergy).patch(editAllergy).delete(removeAllergy);

module.exports = router;
