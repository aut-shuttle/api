process.env.NODE_ENV = 'development'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

const faker = require('faker')

const paymentDetails = {
	user_id: 1,
	payment_id: 'jhgfd',
	transaction_hash: 'JHBGVF.876XDCF43.HGFD567WC',
	amount: faker.finance.amount(1, 200, 2)
}
let token = ''

chai.use(chaiHttp)

describe('*********** PAYMENT ***********', () => {
	/**
	 * GET REQUESTS
	 */
	describe('/GET payments', () => {
		it('it should NOT be able to consume the route since no token was sent', done => {
			chai
				.request(server)
				.get('/payments')
				.end((err, res) => {
					res.should.have.status(401)
					done()
				})
		})
		it('it should GET all payments', done => {
			chai
				.request(server)
				.get('/payments')
				.set('Authorization', `Bearer ${token}`)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.an('object')
					res.body.docs.should.be.an('array')
					done()
				})
		})
	})

	describe('/GET/:id payment', () => {
		it('it should GET a payment by the given id', done => {
			chai
				.request(server)
				.get(`/users/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.end((error, res) => {
					res.should.have.status(200)
					res.body.should.be.a('object')
					res.body.should.have.property('transactionID')
					done()
				})
		})
	})

	/**
	 * POST REQUESTS
	 */
	describe('/POST payment', () => {
		it('it should POST payment data', done => {
			chai
				.request(server)
				.post('/payments')
				.send(paymentDetails)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.an('object')
					res.body.should.have.property('tranactionID')
					done()
				})
		})
	})

	/**
	 * PATCH REQUESTS
	 */
	describe('/PATCH payment', () => {
		it('it should NOT PATCH any payments as the method is not allowed', done => {
			chai
				.request(server)
				.delete('/payments')
				.end((err, res) => {
					res.should.have.status(405)
					done()
				})
		})
	})

	/**
	 * DELETE REQUESTS
	 */
	describe('/DELETE payment', () => {
		it('it should NOT DELETE any payments as the method is not allowed', done => {
			chai
				.request(server)
				.delete('/payments')
				.end((err, res) => {
					res.should.have.status(405)
					done()
				})
		})
	})
})
