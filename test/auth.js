process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()
const faker = require('faker')

chai.use(chaiHttp)

describe('*********** AUTH ***********', () => {
	describe('Register', () => {
		it('it should register a user ', done => {
			const user = {
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
				date_of_birth: faker.date.past(20),
				gender: 'MALE',
				email_address: faker.internet.email(),
				password: faker.random.word(10),
				university_id: faker.random.number(20000),
				id_expiry: faker.date.future(2)
			}
			chai
				.request(server)
				.post('/Auth/register')
				.send(user)
				.end((err, res) => {
					res.should.have.status(201)
					done()
				})
		})
		it('it should fail to register an existing', done => {
			const userOne = {
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
				date_of_birth: faker.date.past(20),
				gender: 'MALE',
				email_address: "mikegjeffcoat@SpeechGrammar.com",
				password: faker.random.word(10),
				university_id: faker.random.number(20000),
				id_expiry: faker.date.future(2)
            }
            const userTwo = {
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
				date_of_birth: faker.date.past(20),
				gender: 'MALE',
				email_address: "mikegjeffcoat@SpeechGrammar.com",
				password: faker.random.word(10),
				university_id: faker.random.number(20000),
				id_expiry: faker.date.future(2)
			}
			chai
				.request(server)
				.post('/Auth/register')
                .send(userOne)
                .send(userTwo)
				.end((err, res) => {
					res.should.have.status(400)
					done()
				})
		})
	})
})
