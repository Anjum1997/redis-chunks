const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controller/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/login/:id', auth(['admin', 'user']), userController.getUserById);
router.delete('/login/:id', auth(['admin','user']), userController.deleteUserById);
router.get('/addresses/all', auth(['admin']), userController.getAllUsersWithAddresses);

module.exports = router;
