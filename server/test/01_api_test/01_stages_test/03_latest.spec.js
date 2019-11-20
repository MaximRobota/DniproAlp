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
var module_script_root = '/stages/latest';
var url = base_url + module_script_root;


describe("Test /latest Stages endpoint", function(){
    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });
    describe("latest Stages GET positive",function(){
        before(function(done){

            // Created_at matters here, because of method sort by creation time
            var created_at_field = Date.now();

            let stage1 = new Stage({
                name: 'latest_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',
                created_at: created_at_field + 1

            });

            let stage2 = new Stage({
                name: 'latest_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',
                created_at: created_at_field + 2

            });
            let stage3 = new Stage({
                name: 'latest_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',
                created_at: created_at_field + 3

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

        var listOfNamesObjects = '';
        
        it("Should have correct Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).not.to.equal(404);
                expect(res.statusCode).to.equal(200);
                done();
            })
        });

        it("Response should be correct type: number", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.a('number');
                done();
            })
        });

        it("Should have a correct value of 3", function(done){

            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.equal(3);
                done();
            });
        });

        describe("Add 3 more Stages", function(){

            before(function(done){
                // Created_at matters here, because of method sort by creation time
                var created_at_field = Date.now();

                let stage4 = new Stage({
                    name: 'latest_stage_4',
                    _index: 4,
                    ip_address: '200.255.220.232',
                    description: 'Some description',
                    created_at: created_at_field + 1

                });

                let stage5 = new Stage({
                    name: 'latest_stage_5',
                    _index: 5,
                    ip_address: '200.255.220.232',
                    description: 'Some description',
                    created_at: created_at_field + 2

                });
                let stage6 = new Stage({
                    name: 'latest_stage_6',
                    _index: 6,
                    ip_address: '200.255.220.232',
                    description: 'Some description',
                    created_at: created_at_field + 3

                });
                
                Stage.insertMany([stage4, stage5, stage6], ()=>{
                    done();
                });

            });
            it("Should have a value of 6", function(done){
                request.get(module_script_root)
                .end(function(err, res){
                    expect(res.body).to.be.equal(6);
                    done();
                });
            });
        })
        describe("Add 2 more Stages with different time and index", function(){

            before(function(done){
                // Created_at matters here, because of method sort by creation time
                var created_at_field = Date.now();

                let stage10 = new Stage({
                    name: 'latest_stage_10',
                    _index: 10,
                    ip_address: '200.255.220.232',
                    description: 'Some description',
                    created_at: created_at_field + 1

                });

                let stage8 = new Stage({
                    name: 'latest_stage_8',
                    _index: 8,
                    ip_address: '200.255.220.232',
                    description: 'Some description',
                    created_at: created_at_field + 2

                });

                Stage.insertMany([stage10, stage8], ()=>{
                    done();
                });

            });
            it("Should have a value of 8", function(done){
                request.get(module_script_root)
                .end(function(err, res){
                    expect(parseInt(res.body)).to.be.equal(8);
                    done();
                });
            });
        })
        describe("Add 1 more Stage with index 7", function(){

            before(function(done){
                // Created_at matters here, because of method sort by creation time
                var created_at_field = Date.now();

                let stage11 = new Stage({
                    name: 'latest_stage_11',
                    _index: 11,
                    ip_address: '200.255.220.232',
                    description: 'Some description',
                    created_at: created_at_field + 1

                });
                Stage.insertMany([stage11], ()=>{
                    done();
                });

            });
            it("Should have a value of 11", function(done){
                request.get(module_script_root)
                .end(function(err, res){
                    expect(res.body).to.be.equal(11);
                    done();
                });
            });
        })
    });

    describe("latest Stages GET negative", function(){
        it("Should have 200 Status", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.statusCode).to.be.equal(200);
                done();
            });
        });

        it("Response should be correct type: number", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.a('number');
                done();
            })
        });

        it("Should have a value of 0", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(parseInt(res.body)).to.be.equal(0);
                done();
            });
        });
    });
});