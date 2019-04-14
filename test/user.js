process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()
const faker = require('faker')

chai.use(chaiHttp)

describe('/POST user', () => {
	it('it should NOT POST an empty User', done => {
		const user = {}
		chai
			.request(server)
			.post('/Users')
			.send(user)
			.end((err, res) => {
				res.should.have.status(400)
				done()
			})
	})
	it('it should POST a user ', done => {
		const user = {
			points: faker.random.number(500),
			first_name: faker.name.firstName(),
			last_name: faker.name.lastName(),
			date_of_birth: faker.date.past(20),
			gender: 'MALE',
			role_id: faker.random.number(3),
			email_address: faker.internet.email(),
			password: faker.random.word(10),
			university_id: faker.random.number(20000),
			id_expiry: faker.date.future(2)
		}
		chai
			.request(server)
			.post('/Users')
			.send(user)
			.end((err, res) => {
				res.should.have.status(201)
				done()
			})
	})
})
