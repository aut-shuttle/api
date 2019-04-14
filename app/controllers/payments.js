const Payment = require('../models/').Payments
const User = require('../models/').User
const paypal = require('../middleware/paypal')

const validTopups = new Set(['10', '20', '30', '50', '80', '100'])

module.exports = {
	/**
	 * Creates a payment based on given details.
	 * @param {Object} req Request body
	 * @param {Object} res Response body
	 */
	pay(req, res) {
		// Identify User
		User.findOne({ where: { id: req.body.user_id } })
			.then(user => {
				// Retrieve Balances
				const currentBalance = user.balance
				const topupAmount = req.body.amount

				// Check Balance and Topup
				if (currentBalance + topupAmount > 200) {
					res.status(400).send('Your account balance cannot be more than $200.')
				} else if (!validTopups.has(topupAmount)) {
					res.status(400).send('Please choose a valid topup amount.')
				} else {
					// Proceed with Payment
					console.log(`${user.first_name} is topping up $${amount}`)

					// Set Up Payment
					var payReq = JSON.stringify({
						intent: 'sale',
						payer: {
							payment_method: 'paypal'
						},
						redirect_urls: {
							return_url: `http://localhost:${process.env.PORT}/payments/success`,
							cancel_url: `http://localhost:${process.env.PORT}/payments/err`
						},
						transactions: [
							{
								amount: {
									total: topupAmount,
									currency: 'NZD'
								},
								description: `$${topupAmount} AUT Shuttle Account Topup.`
							}
						]
					})

					// Create Payment
					const success = paypal.createPayment()
					if (success) {
						Payment.create({
							user_id: req.body.user_id,
							payment_id: success.paymentId,
							transaction_hash: req.body.transaction_hash,
							amount: req.body.amount
						})
							.then(payment => res.status(201).send(payment))
							.catch(error => res.status(400).send(error))
					}
				}
			})
			.catch(error => res.status(400).send(error))

		/* return Payment.create({
			user_id: req.body.user_id,
			payment_id: req.body.payment_id,
			transaction_hash: req.body.transaction_hash,
			amount: req.body.amount
		})
			.then(payment => res.status(201).send(payment))
			.catch(error => res.status(400).send(error)) */
	},

	success(req, res) {
		// Execute Payment
		const pay = paypal.executePayment(req)
		if (pay.status !== 200) {
			res.status(400).send(pay.message) // Error
		} else {
			res.status(200).send(pay) // OK
		}
	},

	/**
	 * Returns the details for all payments.
	 * @param {Object} req Request body
	 * @param {Object} res Response body
	 */
	getAll(req, res) {
		Payment.findAll({})
			.then(payment => res.status(200).send(payment))
			.catch(error => res.status(400).send(error))
	},

	/**
	 * Returns info about a given payment.
	 * @param {Object} req Request body
	 * @param {Object} res Response body
	 */
	getOne(req, res) {
		const id = req.params.id
		Payment.findOne({ where: { id: id } })
			.then(payment => res.status(200).send(payment))
			.catch(error => res.status(400).send(error))
	}
}
