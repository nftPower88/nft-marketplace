const router = require('express').Router();
const {userController} = require('../controller');

// Retrieve all Users
router.get('/', userController.findAll);

// Retrieve a single User with id
router.get('/:id', userController.findOne);


module.exports = router;
