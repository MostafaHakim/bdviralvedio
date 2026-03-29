const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

router.post('/register', upload.single('image'), authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
