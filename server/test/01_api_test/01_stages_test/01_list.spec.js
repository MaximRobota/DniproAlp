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


describe("Test / Stages endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });

    describe("List Stages GET positive", function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'list_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'list_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'list_stage_3',
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

        var listOfStages = ''
        it("Should have correct Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).not.to.equal(404);
                expect(res.statusCode).to.equal(200);
                done(err);
            })
        });
        it('Should be list of 3 stages in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done();
            })
        });


        it("Checks types of dictionary data in response", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfStages =  res.body;
                for (var i=0; i<listOfStages.length; i++){
                    expect(listOfStages[i].name).to.be.a('string');
                    expect(listOfStages[i].ip_address).to.be.a('string');
                    expect(listOfStages[i].description).to.be.a('string');
                    expect(listOfStages[i].description).to.not.be.a('number');
                    expect(listOfStages[i]._index).to.be.a('number');
                    expect(listOfStages[i]._index).to.not.be.a('string');

                    expect(listOfStages[i].created_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    })
                    expect(listOfStages[i].updated_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    })
                };
                done();
            })
        });
        it("Should be sorted by index field in" + 
           " increasing order in response", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfStages =  res.body;
                for (var i=0; i<listOfStages.length-1; i++){
                    expect(listOfStages[i]._index).to.be.lessThan(listOfStages[i+1]._index)
                };
                for (var i=0; i<listOfStages.length-1; i++){
                    expect(listOfStages[i]._index).to.not.be.greaterThan(listOfStages[i+1]._index)
                };
                done();
            })
        });
        it("Shouldn't be equal objects in list", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfStages =  res.body;
                for (var i=0; i<listOfStages.length-1; i++){
                    expect(listOfStages[i]).to.not.be.equal(listOfStages[i+1])
                };
                expect(Array.from(new Set(listOfStages))).to.have.lengthOf(listOfStages.length);
                done();
            })
        });
    });
    describe("List Stages GET negative(no stages)",function(){

        it("Check Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.be.equal(500);
                expect(res.statusCode).not.to.be.equal(404);
                expect(res.statusCode).to.be.equal(200);
                done(err);
            })


        });
        it("Type of response", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.not.be.an('object');
                expect(res.body).to.not.be.an('string');
                expect(res.body).to.be.a('array');
                done();
            })

        });

        it('Checks for empty list in parsed JSON from res.body', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.not.have.lengthOf.greaterThan(0);
                expect(res.body).to.have.lengthOf(0);
                done();
            })
        });
    });
});

