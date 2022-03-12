let chai = require('chai');
let chaiHttp = require('chai-http');

const expect = require('chai').expect;

chai.use(chaiHttp);
const url = 'http://localhost:9090/api/v2';

describe('Register one user: ', () => {

    it('should insert an user and return status 200', (done) => {
        chai.request(url)
            .post('/users')
            .send({ username: "test", 
                    name: "Name and Lastname", 
                    email: "test@test.com", 
                    phoneNumber: 1111223344, 
                    password: "password", 
                    addresses: [{street: "street1",
                                 number: 1234,
                                 city : "Rio Grande",
                                 province: "TDF"
                                }],
                    admin: false,
                    active: true
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should delete an user with a status 200', (done) => {
        chai.request(url)
            .delete('/users/test')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    })
});