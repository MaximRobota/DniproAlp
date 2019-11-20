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


describe("List Acts endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });

    describe("List Acts without Act_items", function(){
        before(function(done){
            let act1 = new Act({
                name: 'list_act_1',
            });
            let act2 = new Act({
                name: 'list_act_2',
            });
            let act3 = new Act({
                name: '1_list_act_3',
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

        it('Should be list of 3 act in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done(err);
            })
        });

        it("Checks types of dictionary data in response", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfActs =  res.body;
                for (var i=0; i<listOfActs.length; i++){
                    expect(listOfActs[i].name).to.be.a('string');
                    expect(listOfActs[i].created_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    })
                    expect(listOfActs[i].updated_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    })
                };
                done(err);
            })
        });

        it("Shouldn't be equal objects in list", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfActs =  res.body;
                for (var i=0; i<listOfActs.length-1; i++){
                    expect(listOfActs[i]).to.not.be.equal(listOfActs[i+1])
                };
                expect(Array.from(new Set(listOfActs))).to.have.lengthOf(listOfActs.length);
                done(err);
            })
        });
        it("Should be [list_act_1, list_act_2, 1_list_act_3] names in list and sorted by name", function(done){
            let test_names = ["1_list_act_3", "list_act_1", "list_act_2"];
            request.get(module_script_root)
            .end(function(err, res){
                let listOfActs =  res.body;
                for (var i=0; i<listOfActs.length; i++){
                    expect(listOfActs[i].name).to.be.equal(test_names[i])
                };
                done(err);
            })
        });
    });

    describe("List Acts with Act_items", function(){
        before(function(done){
            //object_id must have lengthOf 24 
            let act_id = new mongoose.Types.ObjectId("1234".repeat(6));
            let act_item_id = new mongoose.Types.ObjectId("1233".repeat(6));
            let scene_id = new mongoose.Types.ObjectId("1232".repeat(6));
            let camera_id = new mongoose.Types.ObjectId("1231".repeat(6));

            let scene1 = new Scene({
                _id: scene_id,
                name: 'list_act_scene_1',
                description: "someDescription",
                customer: ['cust1', 'cust2'],
                actor: ['actor1', 'actor2'],
                snap: {
                    git_filename: 'test.xml',
                    git_sha: 'githubCommitHash',
                    commands: [{
                        l: [
                            1,
                            2,
                            3
                        ],
                        _s: 'Some Snap command'
                    }]
                },
                light_level: 2
            });

            let camera1 = new NOSECamera({
                _id: camera_id,
                id: "cameraIDFromHOS-NOSE",
                name: "list_act_cam1"
            });

            let act_item1 = new ActItem({
                _id: act_item_id,
                act_id: act_id,
                scene_id: scene_id,
                cameras: [camera_id],
                services: ['service1', 'service2'],
                iterations: 2
            });
            let act1 = new Act({
                _id: act_id,
                name: 'list_act_1',
                act_items: [act_item_id]
            });

            act1.save(()=>{
                act_item1.save(()=>{
                    scene1.save(()=>{
                        camera1.save(()=>{
                            done();
                        })
                    })
                })
            });
        });

        after(function(done){
            Act.remove({}, ()=>{
                ActItem.remove({}, ()=>{
                    Scene.remove({}, ()=>{
                        NOSECamera.remove({}, ()=>{
                            done();
                        })
                    })
                })
            });
        });


        var populated_act = '';
        var populated_act_item = '';
        var populated_scene = '';
        var populated_camera = '';

        it("Should have correct Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).not.to.equal(404);
                expect(res.statusCode).to.equal(200);
                populated_act = res.body;
                done(err);
            })
        });

        it('Should be list of 1 act in response', function(done){
            expect(populated_act).to.be.an('array');
            expect(populated_act).have.lengthOf(1);
            populated_act = populated_act[0];
            done();

        });

        it("Check for populated act_item object inside act", function(done){
            expect(populated_act.act_items).to.be.an('array');
            expect(populated_act.act_items).to.have.lengthOf(1);
            populated_act_item = populated_act.act_items[0];

            expect(populated_act_item).to.be.an("object");
            expect(populated_act_item).to.include.keys(
                '_id', 'act_id', 'scene_id',
                'cameras', 'services', 'iterations'
                );
            done();
        })
        it("Check for act_item field types ", function(done){
            expect(populated_act_item._id).to.be.a('string');
            expect(populated_act_item.act_id).to.be.a('string');
            expect(populated_act_item.scene_id).to.be.a('object');
            expect(populated_act_item.iterations).to.be.a('number');
            expect(populated_act_item.cameras).to.be.an('array');
            expect(populated_act_item.services).to.be.an('array');
            done();
        })
        it("Check that scene and cameras are populated", function(done){

            expect(populated_act_item.scene_id).to.have.any.keys('_id', 'name');
            expect(populated_act_item.scene_id.name).to.be.equal('list_act_scene_1');
            expect(populated_act_item.cameras[0]).to.be.an('object');
            expect(populated_act_item.cameras[0]).to.include.keys('_id', 'id', 'name')
            expect(populated_act_item.cameras[0].name).to.be.equal('list_act_cam1');
            done();
        })

        describe("Correctly List 1 act by ID", function(){
            var act_id;
            before(function(done){
                // Create 1 more act 
                act_id = new mongoose.Types.ObjectId("2234".repeat(6));
                let act_item_id = new mongoose.Types.ObjectId("2233".repeat(6));
                let scene_id = new mongoose.Types.ObjectId("2232".repeat(6));
                let camera_id = new mongoose.Types.ObjectId("2231".repeat(6));

                let scene1 = new Scene({
                    _id: scene_id,
                    name: 'list_act_scene_2',
                    description: "someDescription",
                    customer: ['cust1', 'cust2'],
                    actor: ['actor1', 'actor2'],
                    snap: {
                        git_filename: 'test1.xml',
                        git_sha: 'githubCommitHash',
                        commands: [{
                            l: [
                                1,
                                2,
                                3
                            ],
                            _s: 'Some Snap command'
                        }]
                    },
                    light_level: 2
                });

                let camera1 = new NOSECamera({
                    _id: camera_id,
                    id: "cameraIDFromHOS-NOSE2",
                    name: "list_act_cam2"
                });

                let act_item1 = new ActItem({
                    _id: act_item_id,
                    act_id: act_id,
                    scene_id: scene_id,
                    cameras: [camera_id],
                    services: ['service1', 'service2'],
                    iterations: 2
                });
                let act1 = new Act({
                    _id: act_id,
                    name: 'list_act_2',
                    act_items: [act_item_id]
                });

                act1.save(()=>{
                    act_item1.save(()=>{
                        scene1.save(()=>{
                            camera1.save(()=>{
                                done();
                            })
                        })
                    })
                });
            });
            var populated_act = '';
            var populated_act_item = '';
            var populated_scene = '';
            var populated_camera = '';

            it("Should be list of 2 acts in response", function(done){
                request.get(module_script_root)
                .expect('Content-Type', /json/)
                .end(function(err, res){
                    expect(res.body).have.lengthOf(2);
                    done(err);
                })
            });

            it("should return 1 correctly populated act by ID", function(done){
                request.get(module_script_root + '/' + act_id.toString())
                .expect('Content-Type', /json/)
                .end(function(err, res){
                    expect(res.body).to.be.an('object');
                    populated_act = res.body
                    done(err);
                })
            })
            it("Check for populated act_item object inside act", function(done){
                expect(populated_act.act_items).to.be.an('array');
                expect(populated_act.act_items).to.have.lengthOf(1);
                populated_act_item = populated_act.act_items[0];

                expect(populated_act_item).to.be.an("object");
                expect(populated_act_item).to.include.keys(
                    '_id', 'act_id', 'scene_id',
                    'cameras', 'services', 'iterations'
                    );
                done();
            })
            it("Check for act_item field types ", function(done){
                expect(populated_act_item._id).to.be.a('string');
                expect(populated_act_item.act_id).to.be.a('string');
                expect(populated_act_item.scene_id).to.be.a('object');
                expect(populated_act_item.iterations).to.be.a('number');
                expect(populated_act_item.cameras).to.be.an('array');
                expect(populated_act_item.services).to.be.an('array');
                done();
            })
            it("Check that scene and cameras are populated", function(done){

                expect(populated_act_item.scene_id).to.have.any.keys('_id', 'name');
                expect(populated_act_item.scene_id.name).to.be.equal('list_act_scene_2');
                expect(populated_act_item.cameras[0]).to.be.an('object');
                expect(populated_act_item.cameras[0]).to.include.keys('_id', 'id', 'name')
                expect(populated_act_item.cameras[0].name).to.be.equal('list_act_cam2');
                done();
            })
        })
    });
    
    describe("List Acts GET negative(no acts)",function(){

        it("Wrong format act ID", function(done){
            request.get(module_script_root + '/WrongformatActId')
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.be.equal(500);
                expect(res.statusCode).not.to.be.equal(200);
                expect(res.statusCode).to.be.equal(404);
                expect(res.body).to.be.an('array').and.have.lengthOf(0);
                done(err);
            })
        });

        it("Non-existing act ID", function(done){
            request.get(module_script_root + '/' + '1'.repeat(24))
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.be.equal(500);
                expect(res.statusCode).not.to.be.equal(200);
                expect(res.statusCode).to.be.equal(404);
                expect(res.body).to.be.an('array').and.have.lengthOf(0);
                done(err);
            })
        });
    });
});

