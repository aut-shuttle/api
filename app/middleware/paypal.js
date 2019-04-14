var path = require('path')
var paypal = require('paypal-rest-sdk')

// Configure PayPal
paypal.configure({
	mode: process.env.PAYPAL_MODE || 'sandbox', // Sandbox or Live
	client_id: process.env.PAYPAL_CLIENT_ID, // Client ID
	client_secret: process.env.PAYPAL_CLIENT_SECRET // Client Secret
})

const createPayment = (req, res) => {
	paypal.payment.create(payReq, function(error, payment) {
		var links = {}

		if (error) {
			console.error(JSON.stringify(error))
		} else {
			// Capture HATEOAS links
			payment.links.forEach(function(linkObj) {
				links[linkObj.rel] = {
					href: linkObj.href,
					method: linkObj.method
				}
			})

			// If the redirect URL is present, redirect the customer to that URL
			if (links.hasOwnProperty('approval_url')) {
				// Redirect the customer to links['approval_url'].href
				res.redirect(links['approval_url'].href)
			} else {
				console.error('no redirect URI present')
			}
		}
	})
}

const executePayment = (req, res) => {
	var payerId = { payer_id: req.query.PayerID }
	var paymentId = req.query.paymentId

	paypal.payment.execute(paymentId, payerId, function(error, payment) {
		if (error) {
			console.error(JSON.stringify(error))
			res.status(400).send('Payment Unsuccessful')
		} else {
			if (payment.state == 'approved') {
				console.log('Payment Completed')
				res.status(200).send('Payment Approved')
			} else {
				console.log('Payment Not Successful')
				res.status(400).send('Payment Unsuccessful')
			}
		}
	})
}
