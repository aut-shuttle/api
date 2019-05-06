require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const path = require('path')
const app = express()

// Express port, default: 3000
const port = process.env.PORT || 3000;

// Development Only: Enable HTTP request logger
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// Limit JSON request size
app.use(
	bodyParser.json({
		limit: '20mb'
	})
)
// Limit application/x-www-form-urlencoded request size
app.use(
	bodyParser.urlencoded({
		limit: '20mb',
		extended: true
	})
)

//Database initialisation
const models = require('./app/models')

models.sequelize
	//.sync()
	.authenticate()
	.then(function() {
		console.log('Nice! Database working')
	})
	.catch(function(err) {
		console.log(err, 'something is wrong')
	})

// Initialise Middleware
app.use(cors())
app.use(passport.initialize())
app.use(helmet())
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use(require('./app/routes'))
app.listen(port)

module.exports = app
