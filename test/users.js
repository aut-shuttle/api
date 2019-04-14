process.env.NODE_ENV = 'test'

//const User = require('...app/models/users')
//const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
// eslint-disable-next-line no-unused-vars

const should = chai.should()

const regoDetails = {
    firstName: 'thea',
    lastName: 'miguel',
    email: 'admin@admin.com',
    password: '1234',
    ID: '12345678'
}

let token = ''
//const email = faker.internet.email()
const createID = []

chai.use(chaiHttp)

/* trying to make my own test */

describe('***** REGISTERING *****', () => {
    describe('/POST user rego', () => {
      it('it should GET registration details', done => {
        chai 
          .request(server)
          .post('/users')
          //.set('Authorization', Bearer ${token})
          .send(regoDetails)
          .end((err, res) => {
            res.should.have.status(404)
            res.body.should.be.an('object')
            res.body.should.have.property('token')
            done()
          })
      })
    })

  })

  describe('/POST user', () =>{
      it('it should NOT POST a registration details without first name, surname, password, valid emalil/ID', done =>{
          const user = {}
          chai
            .request(server)
            .post('/users')
            .set('Authorisation', `Bearer ${token}`)
            .send(user)
            .end((err,res) =>{
                res.should.have.status(422)
                res.body.should.be.a('object')
                res.body.should.have.property('errors')
                done()
            })
      })
      it('it should POST a user', done => {
          const user = {
          name: faker.random.words(),
          email,
          password: faker.random.words(),
          role: 'admin',
          urlTwitter: faker.internet.url(),
          urlGitHub: faker.internet.url(),
          phone: faker.phone.phoneNumber(),
          city: faker.random.words(),
          country: faker.random.words()
        }
        
        chai
            .request(server)
            .post('/users')
            .set('Authorisation', `Bearer ${token}`)
            .send(user)
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.a('object')
                res.body.should.include.keys('_id', 'name', 'email', 'verification')
                createdID.push(res.body._id)
                done()
            })

        })
    })

    it('it should NOT POST a user with an account that already exists', done => {
        const user = {
            name: faker.random.words(),
            email,
            password: faker.random.words(),
            role: 'admin'
            }
        chai
            .request(server)
            .post('/users')
            .set('Authorisation', `Bearer ${token}`)
            .send(user)
            .end((err, res) => {
                res.should.have.status(422)
                res.body.should.be.a('object')
                res.body.should.have.property('errors')
                done()
        })
    })

    after(() => {
        createdID.forEach(id => {
            User.findByIdAndRemove(id, err => {
                if(err){
                    console.log(err)
                }
            })
        })
    })


