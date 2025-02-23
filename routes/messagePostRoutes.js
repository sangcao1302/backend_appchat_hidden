const express = require('express');
const router = express.Router();
const { messagePost } = require('../controller/Message/MessagePost');

router.post('/messages', messagePost);

module.exports = router