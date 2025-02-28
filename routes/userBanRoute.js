const express = require('express');
const router = express.Router();
const { userPostBan } = require('../controller/User/UserPost');

module.exports = (io) => {
    router.post('/user/ban/:userId', (req, res) => userPostBan(req, res, io));
    return router;
};
