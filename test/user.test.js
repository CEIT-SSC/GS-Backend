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

    // it('Creating new user /user/ POST',done=>{
    //     chai.request(app)
    //         .get('/user/')
    //         .set('Authorization',`Bearer ${authToken}`)
    //         .end((err,res)=>{
    //             if(err) done(err);
    //             res.body.should.be.a('object');
    //         });
    // });
});