const router = require('express').Router();
const { messageController } = require('../controller');

router.post('/', messageController.create);

module.exports = router;