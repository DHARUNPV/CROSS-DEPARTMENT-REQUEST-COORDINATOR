const express = require('express');
const router = express.Router();
const { getByRequestId, download } = require('../controllers/certificateController');
const { auth } = require('../middleware/auth');

router.get('/request/:requestId', auth, getByRequestId);
router.get('/request/:requestId/download', auth, download);

module.exports = router;
