import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const Act = mongoose.model('Act');
const Scene = mongoose.model('Scene');
const ActItem = mongoose.model('ActItem');
const NOSECamera = mongoose.model('NOSECamera');

var base_url = config.testing.apiPrefix;
var module_script_root = '/acts';
var url = base_url + module_script_root;


describe("Test Create Acts endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });

    describe("Create correct Act POST",function(){

        before(function(done){
            let act1 = new Act({
                name: 'create_act_1'
            });

            let act2 = new Act({
                name: 'create_act_2'
            });
            let act3 = new Act({
                name: 'create_act_3'
            });
            Act.insertMany([act1, act2, act3], ()=>{
                done();
            });
        });

        after(function(done){
            Act.remove({}, ()=>{
                done();
            });
        });

        var new_act = {}
        var created_act = {}
        it("Create new correct Act (4th). Should have 200 status. " +
            "Should have correct content-type in response.", function(done){

            new_act = {
                "name": "create_act_4"
            }
            request.post(module_script_root)
            .send(new_act)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_act = res.body;
                done(err);
            })
        });
        it("response should be with created object with the same data", function(done){
            expect(created_act).to.include.keys("_id", "name", "created_at", "updated_at");
            expect(created_act.name).to.be.equal(new_act.name);
            expect(created_act.updated_at).to.be.a('string');
            expect(created_act.created_at).to.be.a('string')
            .and.to.satisfy(function(str){
                    return new Date(str)
            })
            expect(created_act.updated_at).to.be.a('string')
            .and.to.satisfy(function(str){
                return new Date(str)
            })
            done();
        });
        it('Should be list of 4 acts in DB', function(done){
            Act.count({}, (err, count)=>{
                expect(count).to.be.equal(4);
                done();               
            })
        });
    });

    describe("Create correct act POST with existing name",function(){

        before(function(done){
            let act1 = new Act({
                name: 'create_act_1',

            });

            act1.save(()=>{
                done();
            });
        });

        after(function(done){
            Act.remove({}, ()=>{
                done();
            });
        });

        var new_act = {}
        var created_act = {}
        it("Should have 500 status. " +
            "Should have correct content-type in response. ", function(done){

            new_act = {
                "name": "create_act_1",
            }
            request.post(module_script_root)
            .send(new_act)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_act = res.body;
                done(err);
            })
        });
        it("response should be error object with fields", function(done){
            expect(created_act).to.have.include.keys('result', 'error_details',
                                                   'msg', 'fields');
            expect(created_act.error_details).to.have.include.keys('error_name',
                                                                 'error_message',);
            expect(created_act.error_details.error_name).
            to.be.equal("Validation Error");
            expect(created_act.error_details.error_message).
            to.be.equal("Choose another name");
            done();
        });
        it('Should be list of 1 act in DB', function(done){
            Act.count({}, (err, count) => {
                expect(count).to.be.equal(1);
                done();
            })
        });
    });
});

