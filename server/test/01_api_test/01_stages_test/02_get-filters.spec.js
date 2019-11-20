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
var module_script_root = '/stages/getfilters';
var url = base_url + module_script_root;


describe("Test /getfilters Stages endpoint", function(){
    
    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    describe("getfilters Stages GET positive",function(){
        before(function(done){

            let stage1 = new Stage({
                name: 'filter_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'filter_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'filter_stage_3',
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
        
        it("URL without criteria Should have correct Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).not.to.equal(200);
                expect(res.statusCode).to.equal(404);
                done(err);
            })
        });

        it("URL with wrong criteria Should have correct Statuses", function(done){
            request.get(module_script_root + "/id")
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(404);
                expect(res.statusCode).not.to.equal(200);
                expect(res.statusCode).to.equal(500);
                done(err);
            })
        });

        it("URL with correct criteria Should have correct Statuses", function(done){
            request.get(module_script_root + "/name")
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).not.to.equal(404);
                expect(res.statusCode).to.equal(200);
                done(err);
            })
        });

        it("Should be a array and have length of 3", function(done){
            request.get(module_script_root + "/name")
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done();
            })
        });

        it("Checks types of data in response", function(done){
            request.get(module_script_root + "/name")
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                done();
            })
        });

        it("Array of objects should have values of" + 
           " key \"name\": filter_stage_1, filter_stage_2, filter_stage_3", function(done){
            request.get(module_script_root + "/name")
            .end(function(err, res){
                let assumed_names = ['filter_stage_1', 'filter_stage_2', 'filter_stage_3'];
                for (var i=0; i<assumed_names.length; i++){
                    expect(res.body[i]).to.be.an('object');
                    expect(res.body[i]).to.have.all.keys('_id', "name");
                    expect(res.body[i].name).to.be.equal(assumed_names[i]);
                }
                done();
            })
          })

        describe("Add 3 more Stages", function(){

            before(function(done){
                let stage4 = new Stage({
                    name: 'filter_stage_4',
                    _index: 4,
                    ip_address: '200.255.220.232',
                    description: 'Some description',

                });

                let stage5 = new Stage({
                    name: 'filter_stage_5',
                    _index: 5,
                    ip_address: '200.255.220.232',
                    description: 'Some description',

                });
                let stage6 = new Stage({
                    name: 'filter_stage_6',
                    _index: 6,
                    ip_address: '200.255.220.232',
                    description: 'Some description',

                });
                Stage.insertMany([stage4, stage5, stage6], ()=>{
                    done();
                });
            });

            it('Should be array of 6 elements in parsed JSON', function(done){
                request.get(module_script_root + "/name")
                .end(function(err, res){
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(6);
                    done();
                });
            });

            it("Array of objects should have values of" + 
               " key \"name\": filter_stage_1, filter_stage_2, filter_stage_3" + 
               " filter_stage_4, filter_stage_5, filter_stage_6", function(done){
                request.get(module_script_root + "/name")
                .end(function(err, res){
                    let assumed_names = [
                        'filter_stage_1', 'filter_stage_2', 'filter_stage_3',
                        'filter_stage_4', 'filter_stage_5', 'filter_stage_6'
                    ];
                    for (var i=0; i<assumed_names.length; i++){
                        expect(res.body[i]).to.be.an('object');
                        expect(res.body[i]).to.have.all.keys('_id', "name");
                        expect(res.body[i].name).to.be.equal(assumed_names[i]);
                    }
                    done();
              })
            })
        })
    });
    describe("getfilters Stages GET negative", function(){
        it("Check data type of response", function(done){
            request.get(module_script_root + '/name')
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res){
                expect(res.body).to.be.a('array');
                expect(res.body).have.lengthOf(0);
                done(err);
            });
        });
    });
});

