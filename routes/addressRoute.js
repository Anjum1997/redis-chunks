const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const addressController = require('../controller/addressController');

router.post('/addAddress', auth(['user']), addressController.addAddress);
router.get('/getAddresses', auth(['user']),addressController.getAddresses);

module.exports = router;
