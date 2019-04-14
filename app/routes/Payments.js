const express = require('express')
const router = express.Router()
const payController = require('../controllers').payments

/*
 * Submit Payment
 */
router.post('/', payController.pay)

/*
 * Get Payments
 */
router.get('/', payController.getAll)

/*
 * Get One Payments
 */
router.get('/:id', payController.getOne)

router.get('/success', payController.success)

module.exports = router
