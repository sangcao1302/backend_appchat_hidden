const express = require('express');
const router = express.Router();
const { messageGet } = require('../controller/Message/MessageGet');

router.get('/messages/:userId', messageGet);

module.exports = router