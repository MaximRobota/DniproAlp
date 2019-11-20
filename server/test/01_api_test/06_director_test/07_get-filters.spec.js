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
const Stage = mongoose.model('Stage');
const NOSECamera = mongoose.model('NOSECamera');
const Play = mongoose.model('Play');
const Director = mongoose.model('Director');

var base_url = config.testing.apiPrefix;
var module_script_root = '/directors/getfilters';
var url = base_url + module_script_root;


describe("Test /directors/getfilters/:by Directors endpoint", function(){
    
    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });
    var scene_names = [
        "filter_scene_1",
        "filter_scene_2",
        "filter_scene_3",
    ];
    var stage_names = [
        'filter_stage_1',
        'filter_stage_2',
        'filter_stage_3',
        'filter_stage_4'
    ];
    var act_names = [
        'filter_act_1',
        'filter_act_2',
        'filter_act_3',
        'filter_act_4',
        'filter_act_5'
    ];
    var camera_names = [
        'filter_cam_1',
        'filter_cam_2',
        'filter_cam_3',
        'filter_cam_4',
        'filter_cam_5'
    ];
    
    var play_names = [
        "filter_play_1",
        "filter_play_2",
        "filter_play_3",
        "filter_play_4"
    ];

    // Must be same len
    var director_statuses = [
        'Pending',
        'Error',
        'Error',
        'Pending',
        'Completed'
    ]
    var director_dates = [
        '11.10.2017',
        '11.11.2017',
        '11.12.2017',
        '11.12.2017',
        '11.13.2017',
    ];

    var max_db_save_iter = 5;

    var scenes_list = [],
    stages_list = [],
    acts_list = [],
    cameras_list = [],
    plays_list = [],
    directors_list = [];

    describe("Directors getfilters data prepare positive",function(){
        before(function(done){
            for (var i = 0; i<max_db_save_iter; i++){
                if (i < scene_names.length){
                    let scene = {
                       name: scene_names[i],
                    }
                    scenes_list.push(scene);
                }
                if (i < stage_names.length){
                    let stage = {
                       name: stage_names[i],
                    }
                    stages_list.push(stage);
                }
                
                if (i < play_names.length){
                    let play = {
                       name: play_names[i],
                    }
                    plays_list.push(play);
                }
                
                let act = {
                   name: act_names[i],
                }
                acts_list.push(act);


                let camera = {
                   name: camera_names[i],
                }
                cameras_list.push(camera);


                let director = {
                   launch_status: director_statuses[i],
                   launch_started_at: new Date(director_dates[i])
                }
                directors_list.push(director);

            }

            Act.collection.insert(acts_list,()=>{
                Scene.collection.insert(scenes_list,()=>{
                    Stage.collection.insert(stages_list,()=>{
                        NOSECamera.collection.insert(cameras_list,()=>{
                            Play.collection.insert(plays_list,()=>{
                                Director.collection.insert(directors_list,() =>{
                                    done();
                                });
                            });
                        })
                    })
                })
            });
        });

        after(function(done){
            Act.remove({}, ()=>{
                Scene.remove({}, ()=>{
                    Stage.remove({},()=>{
                        NOSECamera.remove({}, ()=>{
                            Play.remove({}, ()=>{
                                Director.remove({}, ()=>{
                                    done();
                                });
                            })
                        })
                    })
                })
            });
        });
        
        describe('Positive test for all criterias', function(){
            it("Correct criteria scene check data,statuses", function(done){
                request.get(module_script_root + "/scene")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(scene_names.length);
                    expect(res.body).to.be.all.members(scene_names)
                    done(err);
                })
            });
            it("Correct criteria stage check data,statuses", function(done){
                request.get(module_script_root + "/stage")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(stage_names.length);
                    expect(res.body).to.be.all.members(stage_names)
                    done(err);
                })
            });
            it("Correct criteria act check data,statuses", function(done){
                request.get(module_script_root + "/act")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(act_names.length);
                    expect(res.body).to.be.all.members(act_names)
                    done(err);
                })
            });
            it("Correct criteria play check data,statuses", function(done){
                request.get(module_script_root + "/play")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(play_names.length);
                    expect(res.body).to.be.all.members(play_names)
                    done(err);
                })
            });
            it("Correct criteria director_dates check data,statuses", function(done){
                let uniq_dates = Array.from(new Set(director_dates));
                request.get(module_script_root + "/date")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(uniq_dates.length);
                    done(err);
                })
            });
            it("Correct criteria director_statuses check data,statuses", function(done){
                let statuses = ['Pending', 'Processing', 'Running', 'Completed', 'Error'];
                request.get(module_script_root + "/status")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(statuses.length);
                    expect(res.body).to.be.all.members(statuses)
                    done(err);
                })
            });
            it("Correct criteria camera_names check data,statuses", function(done){
                request.get(module_script_root + "/camera")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(camera_names.length);
                    expect(res.body).to.be.all.members(camera_names)
                    done(err);
                })
            });
        })

        describe('Negative test with wrong URL', function(){
            it("URL without criteria Should have correct Statuses", function(done){
                request.get(module_script_root)
                .expect('Content-Type', /json/)
                .expect(500)
                .end(function(err, res){
                    done(err);
                })
            });

            it("URL with wrong criteria Should have correct Statuses", function(done){
                request.get(module_script_root + "/id")
                .expect('Content-Type', /json/)
                .expect(500)
                .end(function(err, res){
                    expect(res.body).to.be.an('object');
                    expect(res.body.result).to.be.equal(false);
                    done(err);
                })
            });
        })
    });
    describe("getfilters Acts GET negative", function(){
        it("Correct criteria scene check data,statuses", function(done){
                request.get(module_script_root + "/scene")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have.lengthOf(0);
                    done(err);
                })
            });
            it("Correct criteria stage check data,statuses", function(done){
                request.get(module_script_root + "/stage")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have.lengthOf(0);
                    done(err);
                })
            });
            it("Correct criteria act check data,statuses", function(done){
                request.get(module_script_root + "/act")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have.lengthOf(0);
                    done(err);
                })
            });
            it("Correct criteria play check data,statuses", function(done){
                request.get(module_script_root + "/play")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have.lengthOf(0);
                    done(err);
                })
            });
            it("Correct criteria director_dates check data,statuses", function(done){
                request.get(module_script_root + "/date")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have.lengthOf(0);
                    done(err);
                })
            });
            it("Correct criteria director_statuses check data,statuses", function(done){
                let statuses = ['Pending', 'Processing', 'Running', 'Completed', 'Error'];
                request.get(module_script_root + "/status")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(statuses.length);
                    expect(res.body).to.be.all.members(statuses)
                    done(err);
                })
            });
            it("Correct criteria camera_names check data,statuses", function(done){
                request.get(module_script_root + "/camera")
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have.lengthOf(0);
                    done(err);
                })
            });
    });
});

