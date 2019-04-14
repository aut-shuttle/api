const express = require('express')
const router = express.Router()
const userController = require('../controllers').user

//Create User Route
router.post('/', userController.createUser)

//Read all Users
router.get('/', userController.getAll)

// Read one user by ID
router.get('/:id', userController.getOne)

//Update one user by ID
router.patch('/:id', userController.update)

//Delete one user by ID
router.delete('/:id', userController.delete)

// // Old index route kept here for fault finding when I break things
// router.get('/', (req, res) =>
// 	res.status(200).send({
// 		message: 'Users API'
// 	})
// )

module.exports = router
