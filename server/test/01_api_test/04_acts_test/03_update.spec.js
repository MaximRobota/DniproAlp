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


describe("Test Acts UPDATE endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });
    describe("Correct response on wrong url", function(){
        it('Should have 404 if acts put without ID. /acts/', function(done){
            request.put(module_script_root)
            .expect(404)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end((err, res)=>{
                done(err);
            })
        })
    })
    describe("Update Act PUT",function(){

        var objects_count = 0;

        before(function(done){
            let act_id = "3210";
            let act_item_id = "3220";
            let scene_id = "3230";
            let camera_id = "3240";  

            objects_count = 2;

            var before_acts_list = [];
            var before_act_items_list = [];
            var before_scenes_list = [];
            var before_cameras_list = [];
            for (var i=0; i<objects_count; i++){
                act_id = (parseInt(act_id) + i).toString();
                act_item_id = (parseInt(act_item_id) + i).toString();
                scene_id = (parseInt(scene_id) + i).toString();
                camera_id = (parseInt(camera_id) + i).toString();

                let scene = new Scene({
                    _id: new mongoose.Types.ObjectId(scene_id.repeat(6)),
                    name: 'upd_act_scene' + i,
                    description: "someDescription" + i,
                    customer: ['cust1' + i, 'cust2' + i],
                    actor: ['actor1' + i, 'actor2' + i],
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
                    _id: new mongoose.Types.ObjectId(camera_id.repeat(6)),
                    id: "cameraIDFromHOS-NOSE"  + i,
                    name: "upd_act_cam_"  + i
                });
                let act_item = new ActItem({
                    _id: new mongoose.Types.ObjectId(act_item_id.repeat(6)),
                    act_id: new mongoose.Types.ObjectId(act_id.repeat(6)),
                    scene_id: new mongoose.Types.ObjectId(scene_id.repeat(6)),
                    cameras: [new mongoose.Types.ObjectId(camera_id.repeat(6))],
                    services: ['service1' + i, 'service2' + i],
                    iterations: 2
                });
                let act = new Act({
                    _id: new mongoose.Types.ObjectId(act_id.repeat(6)),
                    name: 'upd_act_' + i,
                    act_items: [new mongoose.Types.ObjectId(act_item_id.repeat(6))]
                });

                before_acts_list.push(act);
                before_cameras_list.push(camera);
                before_scenes_list.push(scene);
                before_act_items_list.push(act_item)
            };

            let act1 = new Act({
                name: 'upd_act_1',
            });

            let act2 = new Act({
                name: 'upd_act_2',
            });
            let act3 = new Act({
                name: 'upd_act_3',
            });

            Act.insertMany(before_acts_list, ()=>{
                ActItem.insertMany(before_act_items_list, ()=>{
                    Scene.insertMany(before_scenes_list, ()=>{
                        NOSECamera.insertMany(before_cameras_list, ()=>{
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

        var predefined_act = {};
        var updated_act = {};
        var update_data = {};
        var acts_list = [];
        var new_act_name = 'upd_act_3';

        it('Get first predefined act. This will be object for comparison', function(done){
            Act.findOne({name: 'upd_act_1'}, (err, act)=>{
                predefined_act = act;
                done();
            })
        });

        it('Should give error on incorrect format ID', function(done){
            request.put(module_script_root + "/SomeIncorrectID")
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(0);
                done(err);
            })
        })


        it('Should give error on correct format, but non-existing ID', function(done){
            request.put(module_script_root + "/" + "1".repeat(24))
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(0);
                done(err);
            })
        })

        it("Should change name and save act correctly", function(done){
            let act_id = predefined_act._id;
            request.put(module_script_root + "/" + act_id.toString())
            .send({
                name: new_act_name
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(objects_count);
                acts_list = res.body;
                done(err);
            })

        })
        it("Should not change name if the name exists", function(done){
            let act_id = predefined_act._id;

            request.put(module_script_root + "/" + act_id.toString())
            .send({
                name: "upd_act_0"
            })
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                expect(res.body).to.have.include.keys('result', 'error_details',
                                                   'msg', 'fields');
                expect(res.body.error_details).to.have.include.keys('error_name',
                                                                     'error_message',);
                expect(res.body.error_details.error_name).
                to.be.equal("Validation Error");
                expect(res.body.error_details.error_message).
                to.be.equal("Choose another name");
                done(err);
            })

        })

        it("Should be 2(all acts in DB) objects in response of update", function(done){
            // Updated data
            expect(acts_list).to.be.an('array');
            expect(acts_list).to.have.lengthOf(2);
            done();
        })  

        it('Should be populated acts in response with created_at' + 
            " and new updated_at data and changed name", function(done){
            expect(acts_list).to.have.lengthOf(2);
            for (var i=0; i<objects_count; i++){
                expect(acts_list[i].act_items).to.be.an('array');
                expect(acts_list[i].act_items).to.have.lengthOf(1);
                expect(acts_list[i].act_items[0]).to.be.an("object");
                expect(acts_list[i].act_items[0]).to.include.keys(
                    '_id', 'act_id', 'scene_id',
                    'cameras', 'services', 'iterations'
                    );
                if (acts_list[i]._id == predefined_act._id.toString()){
                    expect(acts_list[i].name).to.be.equal(new_act_name);
                    expect(acts_list[i].name).not.to.be.equal(predefined_act.name);

                } else {
                    expect(acts_list[i].name).to.be.equal('upd_act_0');

                }
            }
            done();
        })
    });

});

