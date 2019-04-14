const User = require('../models/').User
module.exports = {
	/**
	 * Creates a user based on given details.
	 * @param {Object} req Request body
	 * @param {Object} res Response body
	 */
	createUser(req, res) {
		return User.create({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			date_of_birth: req.body.date_of_birth,
			gender: req.body.gender,
			role_id: req.body.role_id,
			email_address: req.body.email_address,
			password: req.body.password,
			balance: req.body.balance,
			university_id: req.body.university_id,
			id_expiry: req.body.id_expiry
		})
			.then(user => res.status(201).send(user))
			.catch(error => res.status(400).send(error))
	},

	/**
	 * Returns the details for all users.
	 * @param {Object} req Request body
	 * @param {Object} res Response body
	 */
	getAll(req, res) {
		User.findAll({})
			.then(users => res.status(200).send(users))
			.catch(error => res.status(400).send(error))
	},

	/**
	 * Returns the given user's details.
	 * @param {Object} req Request body
	 * @param {Object} res Response body
	 */
	getOne(req, res) {
		const id = req.params.id
		User.findOne({ where: { id: id } })
			.then(user => res.status(200).send(user))
			.catch(error => res.status(400).send(error))
	},

	/**
	 * Updates the given user.
	 * @param {Object} req Request body
	 * @param {Object} res Request response
	 */
	update(req, res) {
		const id = req.params.id
		const updates = req.body.updates
		User.findOne({
			where: { id: id }
		})
			.then(user => {
				return user.update(updates)
			})
			.then(user => res.status(200).send(user))
			.catch(error => res.status(400).send(error))
	},

	/**
	 * Deletes the given user from the database.
	 * @param {Object} req Request body
	 * @param {Object} res Request response
	 */
	delete(req, res) {
		const id = req.params.id
		User.destroy({
			where: { id: id }
		})
			.then(deletedUser => {
				res.json(deletedUser)
			})
			.catch(error => res.status(400).send(error))
	}
}
