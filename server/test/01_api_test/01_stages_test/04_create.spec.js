import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const Stage = mongoose.model('Stage');

var base_url = config.testing.apiPrefix;
var module_script_root = '/stages';
var url = base_url + module_script_root;


describe("Test Create Stages endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });

    describe("Create correct Stage POST",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'create_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'create_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'create_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Stage.insertMany([stage1, stage2, stage3], ()=>{
                done();
            });
        });

        after(function(done){
            Stage.remove({}, ()=>{
                done();
            });
        });

        var new_stage = {}
        var created_stage = {}
        it("Create new correct Scene (4th). Should have 200 status. " +
            "Should have correct content-type in response.", function(done){

            new_stage = {
                "_index": 4,
                "name": "create_stage_4",
                "ip_address": "222.222.222.222",
                "description": "123123"
            }
            request.post(module_script_root)
            .send(new_stage)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_stage = res.body;
                done(err);
            })
        });
        it("response should be with created object with the same data", function(done){
            expect(created_stage).to.have.include.keys('_index', 'name', 'ip_address',
                                              'description', '_id', 'updated_at',
                                              'created_at');
            expect(created_stage._index).to.be.equal(new_stage._index);
            expect(created_stage.name).to.be.equal(new_stage.name);
            expect(created_stage.ip_address).to.be.equal(new_stage.ip_address);
            expect(created_stage.description).to.be.equal(new_stage.description);
            expect(created_stage._id).to.be.a('string');
            expect(created_stage.updated_at).to.be.a('string');
            expect(created_stage.created_at).to.be.a('string');
            done();
        });
        it('Should be list of 4 stages in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(4);
                done();
            })
        });
    });

    describe("Create correct Stage POST with existing name",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'create_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'create_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'create_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Stage.insertMany([stage1, stage2, stage3], ()=>{
                done();
            });
        });

        after(function(done){
            Stage.remove({}, ()=>{
                done();
            });
        });

        var new_stage = {}
        var created_stage = {}
        it("Should have 500 status. " +
            "Should have correct content-type in response. ", function(done){

            new_stage = {
                "_index": 4,
                "name": "create_stage_1",
                "ip_address": "222.222.222.222",
                "description": "123123"
            }
            request.post(module_script_root)
            .send(new_stage)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_stage = res.body;
                done(err);
            })
        });
        it("response should be error object with fields", function(done){
            expect(created_stage).to.have.include.keys('result', 'error_details',
                                                   'msg', 'fields');
            expect(created_stage.error_details).to.have.include.keys('error_name',
                                                                 'error_message',);
            expect(created_stage.error_details.error_name).
            to.be.equal("Validation Error");
            expect(created_stage.error_details.error_message).
            to.be.equal("Choose another name");
            done();
        });
        it('Should be list of 3 stages in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done();
            })
        });
    });
    describe("Create Stage POST with nubmer data types. " + 
             " Should be converted and created",function(){
        before(function(done){
            let stage1 = new Stage({
                name: 'create_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'create_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'create_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Stage.insertMany([stage1, stage2, stage3], ()=>{
                done();
            });
        });

        after(function(done){
            Stage.remove({}, ()=>{
                done();
            });
        });

        var new_stage = {}
        var created_stage = {}
        it("Should have 200 status. " +
            "Should have correct content-type in response. ", function(done){

            new_stage = {
                "_index": 4,
                "name": 1,
                "ip_address": "0.0.0.0",
                "description": 1
            }
            request.post(module_script_root)
            .send(new_stage)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_stage = res.body;
                done(err);
            })
        });
        it("response should be with created object with the same data", function(done){
            expect(created_stage).to.have.include.keys('_index', 'name', 'ip_address',
                                              'description', '_id', 'updated_at',
                                              'created_at');
            expect(created_stage._index).to.be.equal(new_stage._index, "Index fail");
            expect(created_stage.name).to.be.equal(new_stage.name.toString(), "name fail");
            expect(created_stage.ip_address).to
            .be.equal(new_stage.ip_address, "ip_address fail");
            expect(created_stage.description).to
            .be.equal(new_stage.description.toString(), "description fail");
            expect(created_stage._id).to.be.a('string');
            expect(created_stage.updated_at).to.be.a('string');
            expect(created_stage.created_at).to.be.a('string');
            done();
        });
        it('Should be list of 4 stages in response', function(done){
            Stage.find({}, (err, stages)=>{
                expect(stages).have.lengthOf(4);
                done();
            });
        });
    });
    describe("Create Stage POST with missing fields",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'create_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'create_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'create_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Stage.insertMany([stage1, stage2, stage3], ()=>{
                done();
            });
        });

        after(function(done){
            Stage.remove({}, ()=>{
                done();
            });
        });

        var new_stage = {}
        it("Missing optional description and required name", function(done){

            new_stage = {
                "_index": 4,
                "ip_address": "222.222.222.222",
            }
            request.post(module_script_root)
            .send(new_stage)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.include.keys('result', 'error_details',
                                                       'msg', 'fields');
                expect(res.body.error_details).to.have.include.keys('error_name',
                                                                     'error_message',);
                expect(res.body.result).to.be.equal(false);
                expect(res.body.error_details.error_name).
                to.be.equal("ValidationError");
                expect(res.body.error_details.error_message).
                to.be.equal("Stage validation failed: name: name is required!");
                done(err);
            });
        });

        it("Missing optional description and required _index", function(done){

            new_stage = {
                name: "create_stage_3",
                ip_address: "200.255.220.232",
                description: "Some description",
            }
            request.post(module_script_root)
            .send(new_stage)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.include.keys('result', 'error_details',
                                                       'msg', 'fields');
                expect(res.body.error_details).to.have.include.keys('error_name',
                                                                     'error_message',);
                expect(res.body.result).to.be.equal(false);
                expect(res.body.error_details.error_name).
                to.be.equal("ValidationError");
                expect(res.body.error_details.error_message).
                to.be.equal("Stage validation failed: _index: _index is required!");
                done(err);
            })
        });
        it('Should be list of 3 stages in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done(err);
            })
        });
    });
});

