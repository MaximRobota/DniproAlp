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
var module_script_root = '/acts/save';
var url = base_url + module_script_root;


describe("Test Acts UPDATE endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });
    

    describe("Test single func:actCreate",function(){
        describe("create=[] should do no updates or creations", function(){
            var act_id = "4000".repeat(6),
            act_item_id = "4001".repeat(6),
            scene_id = "4002".repeat(6),
            camera_id = "4003".repeat(6);
            var act_obj = {
                _id: new mongoose.Types.ObjectId(act_id),
                name: 'save_act_1',
                act_items: [new mongoose.Types.ObjectId(act_item_id)]
            };
            var act_item_obj = {
                _id: new mongoose.Types.ObjectId(act_item_id),
                act_id: new mongoose.Types.ObjectId(act_id),
                scene_id: new mongoose.Types.ObjectId(scene_id),
                cameras: [new mongoose.Types.ObjectId(camera_id)],
                services: ['service1', 'service2'],
                iterations: 2
            };
            var scene_obj = {
                _id: new mongoose.Types.ObjectId(scene_id),
                name: 'save_act_scene',
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
            };
            var camera_obj = {
                _id: new mongoose.Types.ObjectId(camera_id),
                id: "cameraIDFromHOS-NOSE",
                name: "save_act_cam"
            };

            before(function(done){
                let act = new Act(act_obj);
                let act_item = new ActItem(act_item_obj);
                let scene = new Scene(scene_obj);
                let camera = new NOSECamera(camera_obj);

                act.save(()=>{
                    act_item.save(()=>{
                        scene.save(()=>{
                            camera.save(()=>{
                                done();
                            });
                        });
                    });
                });
            });

            after(function(done){
                Act.remove({}, ()=>{
                    ActItem.remove({}, ()=>{
                        Scene.remove({}, ()=>{
                            NOSECamera.remove({}, ()=>{
                                done();
                            });
                        });
                    });
                });
            });

            it('Should be 1 act in DB', function(done){
                Act.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it('Should be 1 scene in DB', function(done){
                Scene.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 camera in DB", function(done){
                NOSECamera.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 act_item in DB", function(done){
                ActItem.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            var populated_act = {},
            populated_act_item = {};
            it("Should save nothing and return populated act with same act_id", function(done){
                let request_body = {
                    create: [],
                    act_id: act_id
                };
                request.post(module_script_root)
                .send(request_body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('object');
                    expect(res.body._id).to.be.equal(act_id);
                    populated_act = res.body;
                    done(err);
                });
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
            });
            it("Check for act_item field types ", function(done){
                expect(populated_act_item._id).to.be.a('string');
                expect(populated_act_item.act_id).to.be.a('string');
                expect(populated_act_item.scene_id).to.be.a('object');
                expect(populated_act_item.iterations).to.be.a('number');
                expect(populated_act_item.cameras).to.be.an('array');
                expect(populated_act_item.services).to.be.an('array');
                done();
            });
            it("Check that scene and cameras are populated", function(done){
                expect(populated_act_item.scene_id).to.have.any.keys('_id', 'name');
                expect(populated_act_item.scene_id.name).to.be.equal('save_act_scene');
                expect(populated_act_item.cameras[0]).to.be.an('object');
                expect(populated_act_item.cameras[0]).to.include.keys('_id', 'id', 'name')
                expect(populated_act_item.cameras[0].name).to.be.equal('save_act_cam');
                done();
            });

            it('Should be 1 act in DB', function(done){
                Act.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it('Should be 1 scene in DB', function(done){
                Scene.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 camera in DB", function(done){
                NOSECamera.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 act_item in DB", function(done){
                ActItem.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });
        });
        
        describe("create=[] shouldn`t create actItem with non-existing/wrong format sceneID", function(){

            var act_id = "4000".repeat(6),
            act_item_id = "4001".repeat(6),
            scene_id = "4002".repeat(6),
            camera_id = "4003".repeat(6);
            var act_obj = {
                _id: new mongoose.Types.ObjectId(act_id),
                name: 'save_act_1',
                act_items: [new mongoose.Types.ObjectId(act_item_id)]
            };
            var act_item_obj = {
                _id: new mongoose.Types.ObjectId(act_item_id),
                act_id: new mongoose.Types.ObjectId(act_id),
                scene_id: new mongoose.Types.ObjectId(scene_id),
                cameras: [new mongoose.Types.ObjectId(camera_id)],
                services: ['service1', 'service2'],
                iterations: 2
            };
            var scene_obj = {
                _id: new mongoose.Types.ObjectId(scene_id),
                name: 'save_act_scene',
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
            };
            var camera_obj = {
                _id: new mongoose.Types.ObjectId(camera_id),
                id: "cameraIDFromHOS-NOSE",
                name: "save_act_cam"
            };

            before(function(done){
                let act = new Act(act_obj);
                let act_item = new ActItem(act_item_obj);
                let scene = new Scene(scene_obj);
                let camera = new NOSECamera(camera_obj);

                act.save(()=>{
                    act_item.save(()=>{
                        scene.save(()=>{
                            camera.save(()=>{
                                done();
                            });
                        });
                    });
                });
            });

            after(function(done){
                Act.remove({}, ()=>{
                    ActItem.remove({}, ()=>{
                        Scene.remove({}, ()=>{
                            NOSECamera.remove({}, ()=>{
                                done();
                            });
                        });
                    });
                });
            });

            it('Should be 1 act in DB', function(done){
                Act.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it('Should be 1 scene in DB', function(done){
                Scene.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 camera in DB", function(done){
                NOSECamera.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 act_item in DB", function(done){
                ActItem.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            var populated_act = {},
            populated_act_item = {};
            it("Should save nothing and return populated act with same act_id", function(done){
                let request_body = {
                    create: [{
                        'scene_id': "2".repeat(24)
                    }],
                    act_id: act_id
                };
                request.post(module_script_root)
                .send(request_body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('object');
                    expect(res.body._id).to.be.equal(act_id);
                    populated_act = res.body;
                    done(err);
                });
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
            });
            it("Check for act_item field types ", function(done){
                expect(populated_act_item._id).to.be.a('string');
                expect(populated_act_item.act_id).to.be.a('string');
                expect(populated_act_item.scene_id).to.be.a('object');
                expect(populated_act_item.iterations).to.be.a('number');
                expect(populated_act_item.cameras).to.be.an('array');
                expect(populated_act_item.services).to.be.an('array');
                done();
            });
            it("Check that scene and cameras are populated", function(done){
                expect(populated_act_item.scene_id).to.have.any.keys('_id', 'name');
                expect(populated_act_item.scene_id.name).to.be.equal('save_act_scene');
                expect(populated_act_item.cameras[0]).to.be.an('object');
                expect(populated_act_item.cameras[0]).to.include.keys('_id', 'id', 'name')
                expect(populated_act_item.cameras[0].name).to.be.equal('save_act_cam');
                done();
            });

            it('Should be 1 act in DB', function(done){
                Act.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it('Should be 1 scene in DB', function(done){
                Scene.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 camera in DB", function(done){
                NOSECamera.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 act_item in DB", function(done){
                ActItem.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });
            it("Should save nothing and return populated act with same act_id", function(done){
                let request_body = {
                    create: [{
                            'scene_id': "2".repeat(24),
                        },
                        {
                            'scene_id': "3".repeat(24),
                        },
                        {
                            'scene_id': "WrongID"
                        }
                    ],
                    act_id: act_id
                };
                request.post(module_script_root)
                .send(request_body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('object');
                    expect(res.body._id).to.be.equal(act_id);
                    populated_act = res.body;
                    done(err);
                });
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
            });
            it("Check for act_item field types ", function(done){
                expect(populated_act_item._id).to.be.a('string');
                expect(populated_act_item.act_id).to.be.a('string');
                expect(populated_act_item.scene_id).to.be.a('object');
                expect(populated_act_item.iterations).to.be.a('number');
                expect(populated_act_item.cameras).to.be.an('array');
                expect(populated_act_item.services).to.be.an('array');
                done();
            });
            it("Check that scene and cameras are populated", function(done){
                expect(populated_act_item.scene_id).to.have.any.keys('_id', 'name');
                expect(populated_act_item.scene_id.name).to.be.equal('save_act_scene');
                expect(populated_act_item.cameras[0]).to.be.an('object');
                expect(populated_act_item.cameras[0]).to.include.keys('_id', 'id', 'name')
                expect(populated_act_item.cameras[0].name).to.be.equal('save_act_cam');
                done();
            });

            it('Should be 1 act in DB', function(done){
                Act.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it('Should be 1 scene in DB', function(done){
                Scene.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 camera in DB", function(done){
                NOSECamera.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });

            it("Should be 1 act_item in DB", function(done){
                ActItem.count({}, (err, count)=>{
                    expect(count).to.be.equal(1);
                    done();
                });
            });
        });
        
        describe("create should create actItem without/with cameras", function(){
            var act_id = "4000".repeat(6),
            act_item_id = "4001".repeat(6),
            scene_id1 = "4002".repeat(6),
            camera_id = "4003".repeat(6),
            scene_id3 = "4004".repeat(6),
            scene_id2 = "4005".repeat(6);
            var act_obj = {
                _id: new mongoose.Types.ObjectId(act_id),
                name: 'save_act_1',
                act_items: [new mongoose.Types.ObjectId(act_item_id)]
            };
            var act_item_obj = {
                _id: new mongoose.Types.ObjectId(act_item_id),
                act_id: new mongoose.Types.ObjectId(act_id),
                scene_id: new mongoose.Types.ObjectId(scene_id1),
                cameras: [new mongoose.Types.ObjectId(camera_id)],
                services: ['service1', 'service2'],
                iterations: 2
            };
            var scene_obj1 = {
                _id: new mongoose.Types.ObjectId(scene_id1),
                name: 'save_act_scene1',
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
            };
            var scene_obj2 = {
                _id: new mongoose.Types.ObjectId(scene_id2),
                name: 'save_act_scene2',
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
            };
            var scene_obj3 = {
                _id: new mongoose.Types.ObjectId(scene_id3),
                name: 'save_act_scene3',
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
            };
            var camera_obj = {
                _id: new mongoose.Types.ObjectId(camera_id),
                id: "cameraIDFromHOS-NOSE",
                name: "save_act_cam"
            };

            before(function(done){
                let act = new Act(act_obj);
                let act_item = new ActItem(act_item_obj);
                let scene = new Scene(scene_obj1);
                let camera = new NOSECamera(camera_obj);

                act.save(()=>{
                    act_item.save(()=>{
                        scene.save(()=>{
                            camera.save(()=>{
                                done();
                            });
                        });
                    });
                });
            });

            after(function(done){
                Act.remove({}, ()=>{
                    ActItem.remove({}, ()=>{
                        Scene.remove({}, ()=>{
                            NOSECamera.remove({}, ()=>{
                                done();
                            });
                        });
                    });
                });
            });
            describe("Create without cameras", function(){

                it('Should be 1 act in DB', function(done){
                    Act.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });

                it('Should be 1 scene in DB', function(done){
                    Scene.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });

                it("Should be 1 camera in DB", function(done){
                    NOSECamera.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });

                it("Should be 1 act_item in DB", function(done){
                    ActItem.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });

                var populated_act = {},
                populated_act_item = {};
                it("Should save nothing and return populated act with same act_id", function(done){
                    let request_body = {
                        create: [{
                                scene_id: scene_id2,
                                iterations: 6,
                                services: ['service1', 'service3']
                            },
                            {
                                scene_id: scene_id3,
                                iterations: 3,
                                services: ['service2', 'service3']
                            }
                        ],
                        act_id: act_id
                    };
                    request.post(module_script_root)
                    .send(request_body)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res){
                        expect(res.body).to.be.an('object');
                        expect(res.body._id).to.be.equal(act_id);
                        populated_act = res.body;
                        done(err);
                    });
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
                });
                it("Check for act_item field types ", function(done){
                    expect(populated_act_item._id).to.be.a('string');
                    expect(populated_act_item.act_id).to.be.a('string');
                    expect(populated_act_item.scene_id).to.be.a('object');
                    expect(populated_act_item.iterations).to.be.a('number');
                    expect(populated_act_item.cameras).to.be.an('array');
                    expect(populated_act_item.services).to.be.an('array');
                    done();
                });
                it("Check that scene and cameras are populated", function(done){
                    expect(populated_act_item.scene_id).to.have.any.keys('_id', 'name');
                    expect(populated_act_item.scene_id.name).to.be.equal('save_act_scene1');
                    expect(populated_act_item.cameras[0]).to.be.an('object');
                    expect(populated_act_item.cameras[0]).to.include.keys('_id', 'id', 'name')
                    expect(populated_act_item.cameras[0].name).to.be.equal('save_act_cam');
                    done();
                });

                it('Should be 1 act in DB', function(done){
                    Act.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });

                it('Should be 1 scene in DB', function(done){
                    Scene.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });

                it("Should be 1 camera in DB", function(done){
                    NOSECamera.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });

                it("Should be 1 act_item in DB", function(done){
                    ActItem.count({}, (err, count)=>{
                        expect(count).to.be.equal(1);
                        done();
                    });
                });
            });
            //describe("Create with cameras", function(){});
        });
    });
});

