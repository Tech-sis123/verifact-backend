
const express = require('express');
const multer = require('multer');
const rumorController = require('../controllers/rumor');
const upload = multer();

const router = express.Router();
router.post('/verify', upload.single('image'), rumorController.verifyRumor);
router.get('/history', rumorController.getPastVerifications);

module.exports = router;