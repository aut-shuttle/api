const User = require('../models').User
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

module.exports = {
	register(req, res) {
		const userData = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			date_of_birth: req.body.date_of_birth,
			gender: req.body.gender,
			role_id: 3,
			email_address: req.body.email_address,
			password: req.body.password,
			balance: 0,
			university_id: req.body.university_id,
			id_expiry: req.body.id_expiry
		}

		User.findOne({
			where: {
				email_address: req.body.email_address
			}
		})
			.then(user => {
				if (!user) {
					bcrypt.hash(req.body.password, 10, (err, hash) => {
						userData.password = hash
						User.create(userData)
							.then(user => {
								res.json({
									status:
										req.body.email_address + ' registered. UserID: ' + user.id
								})
							})
							.catch(err => {
								res.send('error: ' + err)
							})
					})
				} else {
					res.json({ error: 'User already exists' })
				}
			})
			.catch(err => {
				res.send('error: ' + err)
			})
	},

	login(req, res) {
		User.findOne({
			where: {
				email_address: req.body.email_address
			}
		})
			.then(user => {
				if (user) {
					if (bcrypt.compareSync(req.body.password, user.password)) {
						let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
							expiresIn: 1440
						})
						res.send(token)
					} else {
						res.status(400).json({ error: 'Incorrect Password' })
					}
				} else {
					res.status(400).json({ error: 'User does not exist' })
				}
			})
			.catch(err => {
				res.status(400).json({ error: err })
			})
	}
}
