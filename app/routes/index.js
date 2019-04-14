const express = require('express')
const router = express.Router()

const fs = require('fs')
const routesPath = `${__dirname}/`
const { removeExtensionFromFile } = require('../middleware/utils')

// Loop routes path and loads every file as a route except this file and Auth route
fs.readdirSync(routesPath).filter(file => {
	// Take filename and remove last part (extension)
	const routeFile = removeExtensionFromFile(file)
	// Prevents loading of this file and auth file
	return routeFile !== 'index' && routeFile !== 'auth'
		? router.use(`/${routeFile}`, require(`./${routeFile}`))
		: ''
})

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
