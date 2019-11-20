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
var module_script_root = '/acts/getfilters';
var url = base_url + module_script_root;


describe("Test /getfilters Acts endpoint", function(){
    
    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    describe("Acts getfilters [scene, iterations, services, customer] GET positive",function(){
        before(function(done){
            let scene_id1 = new mongoose.Types.ObjectId("1230".repeat(6));
            let scene_id2 = new mongoose.Types.ObjectId("1231".repeat(6));
            let scene_id3 = new mongoose.Types.ObjectId("1232".repeat(6));

            let act_item_id1 = new mongoose.Types.ObjectId("1233".repeat(6));
            let act_item_id2 = new mongoose.Types.ObjectId("1234".repeat(6));
            let act_item_id3 = new mongoose.Types.ObjectId("1235".repeat(6));

            let act_id = new mongoose.Types.ObjectId("1236".repeat(6));

            let scene1 = new Scene({
                _id: scene_id1,
                name: 'filter_scene_1',
                customer: ['customer1', 'customer2']
            });

            let scene2 = new Scene({
                _id: scene_id2,
                name: 'filter_scene_2',
                customer: ["customer1"]
            });
            let scene3 = new Scene({
                _id: scene_id3,
                name: 'filter_scene_3',
                customer: ['customer4']
            });

            let act_item1 = new ActItem({
                _id: act_item_id1,
                act_id: act_id,
                scene_id: scene_id1,
                services: ['service1', 'service2'],
                iterations: 2
            });
            let act_item2 = new ActItem({
                _id: act_item_id2,
                act_id: act_id,
                scene_id: scene_id2,
                services: ['service1', 'service3'],
                iterations: 2
            });

            let act_item3 = new ActItem({
                _id: act_item_id3,
                act_id: act_id,
                scene_id: scene_id3,
                services: ['service2', 'service3'],
                iterations: 1
            });
            let act1 = new Act({
                _id: act_id,
                name: 'list_act_1',
                act_items: [act_item_id1, act_item_id2, act_item_id3]
            });

            Scene.insertMany([scene1, scene2, scene3], ()=>{
                ActItem.insertMany([act_item1, act_item2, act_item3], ()=>{
                    act1.save(()=>{
                        done();
                    })
                })
            });
        });

        after(function(done){
            Scene.remove({}, ()=>{
                ActItem.remove({}, ()=>{
                    Act.remove({}, ()=>{
                        done();
                    })
                })
            });
        });
        
        it("URL without criteria Should have correct Statuses", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(404);
                done(err);
            })
        });

        it("URL with wrong criteria Should have correct Statuses", function(done){
            request.get(module_script_root + "/id")
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.all.keys('result', 'msg');
                expect(res.body.result).to.be.equal(false);
                done(err);
            })
        });

        it("Correct criteria scene check data,statuses", function(done){
            request.get(module_script_root + "/scene")
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('array').and.have.lengthOf(3);
                expect(res.body).to.be.all.members(['filter_scene_1', 
                                                    'filter_scene_2', 
                                                    'filter_scene_3'])
                done(err);
            })
        });
        it("Correct criteria customer check data,statuses", function(done){
            request.get(module_script_root + "/customer")
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('array').and.have.lengthOf(3);
                expect(res.body).to.be.all.members(['customer1', 
                                                    'customer2', 
                                                    'customer4'])
                done(err);
            })
        });
        it("Correct criteria iterations check data,statuses", function(done){
            request.get(module_script_root + "/iterations")
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('array').and.have.lengthOf(2);
                expect(res.body).to.be.all.members([1, 2]) 
                done(err);
            })
        });
        it("Correct criteria services check data,statuses", function(done){
            request.get(module_script_root + "/services")
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('array').and.have.lengthOf(3);
                expect(res.body).to.be.all.members(['service1', 
                                                    'service2', 
                                                    'service3'])
                done(err);
            })
        });

        // it("Should be a array and have length of 3", function(done){
        //     request.get(module_script_root + "/scene")
        //     .end(function(err, res){
        //         expect(res.body).to.be.an('array');
        //         expect(res.body).have.lengthOf(3);
        //         done(err);
        //     })
        // });

        it("Checks types of data in response", function(done){
            request.get(module_script_root + "/scene")
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                done(err);
            })
        });

        it("Array of objects should have values of" + 
           " key \"name\": filter_scene_1, filter_scene_2, filter_scene_3", function(done){
            request.get(module_script_root + "/scene")
            .end(function(err, res){
                let assumed_names = ['filter_scene_1',
                                     'filter_scene_2', 
                                     'filter_scene_3'];
                for (var i=0; i<res.body.length; i++){
                    expect(res.body[i]).to.be.equal(assumed_names[i]);
                }
                done(err);
            })
        })
    });
    describe("getfilters Acts GET negative", function(){
        it("Check negative scenes", function(done){
            request.get(module_script_root + '/scene')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(0);
                done(err);
            })
        })

        it("Check negative customer", function(done){
            request.get(module_script_root + '/customer')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(0);
                done(err);
            })
        })
        it("Check negative services", function(done){
            request.get(module_script_root + '/services')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(0);
                done(err);
            })
        })
        it("Check negative iterations", function(done){
            request.get(module_script_root + '/iterations')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(0);
                done(err);
            })
        })
    });
});

