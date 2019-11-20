import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;

const Play = mongoose.model('Play');
const PlayItem = mongoose.model('PlayItem');
const Act = mongoose.model('Act');
const ActItem = mongoose.model('ActItem');
const Scene = mongoose.model('Scene');
const Stage = mongoose.model('Stage');
const Director = mongoose.model('Director');
const NOSECamera = mongoose.model('NOSECamera');


var base_url = config.testing.apiPrefix;
var module_script_root = '/directors/stage_dir_pending';
var url = base_url + module_script_root;


describe("Test POST /stage_dir_pending list launched plays filtered by creation time(accept ts)", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    var create_obj_count = 4
    var create_time_list_for_directors = [
        new Date('11.10.17'),
        new Date('11.11.17'),
        new Date('11.12.17'),
        new Date('11.13.17'),
    ];
    var status_list_for_directors = [
        'Pending',
        'Pending',
        'Error',
        'Pending'
    ];
    var directors_ids = [
        "1271".repeat(6),
        "1272".repeat(6),
        "1273".repeat(6),
        "1274".repeat(6)
    ]

    describe("Test statuses and body", function(){
        
        before(function(done){

            var before_acts_list = [];
            var before_act_items_list = [];
            var before_scenes_list = [];
            var before_cameras_list = [];
            var before_plays_list = [];
            var before_play_items_list = [];
            var before_stages_list = [];
            var before_directors_list = [];


            for (var i=0; i<create_obj_count; i++){
                let act_id = new mongoose.Types.ObjectId(("120" + i).repeat(6));
                let act_item_id = new mongoose.Types.ObjectId(("121" + i).repeat(6));
                let scene_id = new mongoose.Types.ObjectId(("122" + i).repeat(6));
                let camera_id = new mongoose.Types.ObjectId(("123" + i).repeat(6));
                let play_id = new mongoose.Types.ObjectId(("124" + i).repeat(6));
                let play_item_id = new mongoose.Types.ObjectId(("125" + i).repeat(6));
                let stage_id = new mongoose.Types.ObjectId(("126" + i).repeat(6));
                let director_id = new mongoose.Types.ObjectId(directors_ids[i]);
                //Scene
                let scene = new Scene({
                    _id: scene_id,
                    name: 'pending_scene_' + i,
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

                let camera = new NOSECamera({
                    _id: camera_id,
                    id: "cameraIDFromHOS-NOSE",
                    name: "list_act_cam_" + i
                });
                //Act_item
                let act_item = new ActItem({
                    _id: act_item_id,
                    act_id: act_id,
                    scene_id: scene_id,
                    cameras: [camera_id],
                    services: ['service1', 'service2'],
                    iterations: 2
                });
                //Act
                let act = new Act({
                    _id: act_id,
                    name: 'pending_act_' + i,
                    act_items: [act_item_id]
                });

                // Stage
                let stage = new Stage({
                    _id: stage_id,
                    name: 'pending_stage_' + i,
                    _index: i+1,
                    ip_address: '200.255.220.232',
                    description: 'Some description',

                });
                let play = new Play({
                    _id: play_id,
                    name: "123" + i
                });
                let play_item = new ActItem({
                    _id: play_item_id,
                    act_id: act_id,
                    play_id: play_id
                });
                let director = new Director({
                    _id             : director_id,
                    _index          : i+1,
                    play_id         : play_id,
                    stage_id        : stage_id,
                    launch_status   : status_list_for_directors[i],
                    launch_started_at : new Date("10.11.17"),
                    launch_gmt_offset : 2,
                    created_at: create_time_list_for_directors[i]
                });
                before_acts_list.push(act);
                before_act_items_list.push(act_item)
                before_scenes_list.push(scene);
                before_cameras_list.push(camera);
                before_plays_list.push(play)
                before_play_items_list.push(play_item)
                before_stages_list.push(stage)
                before_directors_list.push(director)

            }
            Act.insertMany(before_acts_list, ()=>{
                ActItem.insertMany(before_act_items_list, ()=>{
                    Scene.insertMany(before_scenes_list, ()=>{
                        Stage.insertMany(before_stages_list,()=>{
                            NOSECamera.insertMany(before_cameras_list, ()=>{
                                Play.insertMany(before_plays_list, ()=>{
                                    PlayItem.insertMany(before_play_items_list, ()=>{
                                        Director.insertMany(before_directors_list, ()=>{
                                            done();
                                        });
                                    })
                                })
                            })
                        })
                    })
                })
            });
        });

        after(function(done){
            Act.remove({}, ()=>{
                ActItem.remove({}, ()=>{
                    Scene.remove({}, ()=>{
                        Stage.remove({},()=>{
                            NOSECamera.remove({}, ()=>{
                                Play.remove({}, ()=>{
                                    PlayItem.remove({}, ()=>{
                                        Director.remove({}, ()=>{
                                            done();
                                        });
                                    })
                                })
                            })
                        })
                    })
                })
            });
        });
        it('Should have status and content-type for positive', function(done){
            let body = {
                "status": "Pending"
            }
            request.post(module_script_root)
            .send(body)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res)=>{
                expect(res.body).to.be.an('array');
                expect(res.body).to.be.have.lengthOf(3);
                done(err);
            })
        })

        it("Checks types of dictionary data in response", function(done){
            let body = {
                "status": "Pending",
                "timestamp": create_time_list_for_directors[1].valueOf()
            }
            request.post(module_script_root)
            .send(body)
            .end(function(err, res){
                let listOfDirectors =  res.body;
                for (let i = 0; i<listOfDirectors.length; i++){
                    expect(listOfDirectors[i].play_id).to.be.a('object');
                    expect(listOfDirectors[i].play_id.name).to.be.a('string');
                    expect(listOfDirectors[i].stage_id).to.be.a('object');
                    expect(listOfDirectors[i]._index).to.be.a('number');
                    expect(listOfDirectors[i].created_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)!='Invalid Date'
                    });
                    expect(listOfDirectors[i].updated_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)!='Invalid Date'
                    })
                };
                done(err);
            })
        });
        it("Shouldn't be equal objects in list", function(done){
            let body = {
                "status": "Pending",
                "timestamp": create_time_list_for_directors[1].valueOf()
            }
            request.post(module_script_root)
            .send(body)
            .end(function(err, res){
                let listOfDirectors =  res.body;
                for (var i=0; i<listOfDirectors.length-1; i++){
                    expect(listOfDirectors[i]).to.not.be.equal(listOfDirectors[i+1])
                };
                expect(Array.from(new Set(listOfDirectors))).to.have.lengthOf(listOfDirectors.length);
                done(err);
            })
        });

        it('Should have 2 populated directors', function(done){
            let body = {
                "status": "Pending",
                "timestamp": create_time_list_for_directors[1].valueOf()
            }
            request.post(module_script_root)
            .send(body)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res)=>{
                expect(res.body).to.be.an('array');
                expect(res.body).to.be.have.lengthOf(2);
                done(err);
            })
        })
        it('Should have status and content-type for negative(wrong json key values)', function(done){
            let body = {
                "status": "213"
            }
            request.post(module_script_root)
            .send(body)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res)=>{
                expect(res.body).to.be.an('array');
                expect(res.body).to.be.have.lengthOf(0);
                done(err);
            })
        })
        it('Should have status and content-type for negative(wrong json key values)', function(done){
            let body = {
                "timestamp": "asd"
            }
            request.post(module_script_root)
            .send(body)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res)=>{
                expect(res.body).to.be.an('array');
                expect(res.body).to.be.have.lengthOf(0);
                done(err);
            })
        })
        it('Should have status and content-type for negative(empty json)', function(done){
            let body = {}
            request.post(module_script_root)
            .send(body)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res)=>{
                expect(res.body).to.be.an('array');
                expect(res.body).to.be.have.lengthOf(0);
                done(err);
            })
        })
    })
});

