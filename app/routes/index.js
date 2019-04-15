const express = require('express')
const router = express.Router()
const routesPath = `${__dirname}/`

// Index Route
router.get('/', (req, res) => {
	res.render('index')
})

// 404 Error - for all non-defined routes
router.use('*', (req, res) => {
	res.status(404).json({
		errors: {
			msg: 'URL_NOT_FOUND'
		}
	})
})

module.exports = router
