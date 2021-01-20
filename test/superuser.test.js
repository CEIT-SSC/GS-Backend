const chai =require ('chai');
const chaiHttp = require ('chai-http');
const app = require('../index');
const mongoose = require ('mongoose');
const config = require ('../utils/config');
const SuperUser= require ("../models/SuperUser");
chai.should();
chai.use(chaiHttp);

describe('Superuser Test', ()=>{
    beforeEach('creating dummy superuser',function(done){
        const superDummy= new SuperUser({
            username:"dumbass",
            password: "dumbpass"
        })
        superDummy.save().then(result=>{
            done()
        }).catch(err=>done(err));
    });
    afterEach('droping dummy superusers',function(done){
        SuperUser.findOneAndRemove({username: 'dumbass'}).then(result=>{
            done();
        }).catch(err=>done(err));
    });
    const superInfo ={
        username: 'dumbass',
        password: 'dumbpass'
    }
    it('Testing /superarea/login', (done)=>{
         chai.request(app)
            .post('/superarea/login')
            .send(superInfo)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('admin');
                res.body.should.have.property('token');
                done();
            });
    });
    it('Testing /superarea/logout', function(done){
        chai.request(app)
            .post('/superarea/login')
            .send(superInfo)
            .end((err,res)=>{
                if(err) done(err);
                res.should.have.status(200);
                res.body.should.have.property('token');
                const token=res.body.token;
                chai.request(app)
                    .post('/superarea/logout')
                    .set('Authorization',`Bearer ${token}`)
                    .end((err,res)=>{
                        if(err)done(err);
                        
                        res.body.should.have.property('message').equal("successfully logged out");
                        done();

                    });

            });
    });
    

});
