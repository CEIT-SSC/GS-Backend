const User = require ("../models/User");
const SuperUser = require ("../models/SuperUser");
const fs= require("fs");
const chai =require ('chai');
const chaiHttp = require ('chai-http');
const app = require('../index');
chai.should();
chai.use(chaiHttp);

describe('User Test',()=>{
    let authToken;
    before('creating dummy superuser',done=>{
        const superDummy= new SuperUser({
            username:"dumbass",
            password: "dumbpass1"
        });
        superDummy.save().then(()=>{
            chai.request(app)
            .post("/superarea/login")
            .send({
                username: 'dumbass',
                password: 'dumbpass1'
            })
            .end((err,res)=>{
                if(err)done(err)
                authToken=res.body.token;
                done();
            });
        });
    });
    after('deleting dummy superuser',done=>{
        SuperUser.findOneAndRemove({username: 'dumbass'}).then(result=>{
            done();
        }).catch(err=>done(err));
    });

    it('Creating new user /user/ POST',done=>{
        User.findOneAndDelete({studentNumber:"9831009"}).then(()=>{
            chai.request(app)
            .post('/user/')
            .send({
                studentNumber:"9831009",
                password:"dummyPass2bruh"
            })
            .end((err,res)=>{
                if(err) done(err);
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                res.body.should.have.property('user');
                done();
            });
        });
    });
    it('getting all users /user/ GET',done=>{
        chai.request(app)
            .get('/user/')
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err) done(err);
                res.body.should.be.a('array');
                res.body[0].should.have.property('studentNumber');
                res.body[0].should.have.property('testCases');
                res.body[0].should.have.property('codes');
                done();
            });
    });

    it('getting specified users /user/{id} GET',done=>{
        chai.request(app)
            .get('/user/9831009')
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err) done(err);
                res.body.should.be.a('object');
                res.body.should.have.property('studentNumber');
                res.body.should.have.property('testCases');
                res.body.should.have.property('codes');
                done();
            });
    });
    
    it('getting specified users /user/{id} GET',done=>{
        chai.request(app)
            .patch('/user/9831009')
            .set('Authorization',`Bearer ${authToken}`)
            .send({
                studentNumber: "9831010"
            })
            .end((err,res)=>{
                if(err) done(err);
                res.body.should.be.a('object');
                res.body.should.have.property('user');
                res.body.should.have.property('message').equal("user updated successfully");
                done();
            });
    });

    
});