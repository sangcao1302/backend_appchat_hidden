const express = require('express');
const router = express.Router();
const { userGet } = require('../controller/User/UserGet');

router.get('/user/:userId', userGet);

module.exports = router