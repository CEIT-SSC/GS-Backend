const chai =require ('chai');
const chaiHttp = require ('chai-http');
const app = require('../app')
const mongoose = require ('mongoose')
const config = require ('../utils/config')
const should = chai.should();
chai.use(chaiHttp)


describe('Superuser',()=>{

    describe('Testing superuser login',()=>{
        let superuser = {
            username: config.SUPERUSER_NAME,
            password: config.SUPERUSER_PASS
        }
        it('should log in with correct inputs',(done)=>{
            chai.request(app)
            .post('/superarea/login')
            .send(superuser)
            .end((err,res)=>{
                res.should.have.status(200);
                res.should.be.a('object');
                res.body.admin.should.have.property('username');
                res.body.should.have.property('token');
                done();
            });
        });
        it("shouldn't login with false inputs",(done)=>{
            let superuser = {
                username: 'falseShit',
                password: 'tsss'
            }
            chai.request(app)
            .post('/superarea/login')
            .send(superuser)
            .end((err,res)=>{
                res.should.have.status(200);
                res.should.be.a('object');
                res.body.should.have.property('error');
                done();
            });
        });
    });
});
