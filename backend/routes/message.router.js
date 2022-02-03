const router = require('express').Router();
const { messageController } = require('../controller');

router.get('/:offset', messageController.findAll);
router.post('/', messageController.create);

module.exports = router; 