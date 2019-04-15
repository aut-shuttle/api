process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

const userDetails = {
	userID: 1,
	name: 'Michael Jeffcoat',
	email: 'mwb8386@autuni.ac.nz',
	studentId: 'mwb8386'
}

chai.use(chaiHttp)

describe('*********** USER ***********', () => {
	describe('/POST user', () => {
		it('it should POST user information', done => {
			chai
				.request(server)
				.post('/user')
				.send(userDetails)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.an('object')
					res.body.should.have.property('name')
					res.body.should.have.property('email')
					res.body.should.have.property('studentId')
					done()
				})
		})
	})
})
