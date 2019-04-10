'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const db = {}

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS,
	{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		operatorAliases: false,

		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000
		}
	}
)

console.log('****************************')
console.log('*    Starting Server')
console.log(`*    Port: ${process.env.PORT || 3000}`)
console.log(`*    NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`*    Database: MySQL`)
console.log('****************************')

fs.readdirSync(__dirname)
	.filter(file => {
		return (
			file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
		)
	})
	.forEach(file => {
		const model = sequelize['import'](path.join(__dirname, file))
		db[model.name] = model
	})

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
