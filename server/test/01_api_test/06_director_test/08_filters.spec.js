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
const PlayItem = mongoose.model('PlayItem');
const ActItem = mongoose.model('ActItem');

var base_url = config.testing.apiPrefix;
var module_script_root = '/directors/filter';
var url = base_url + module_script_root;


describe("Test /directors/filter Directors endpoint", function(){
    
    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });
    var scene_name = "filter_scene_{i}",
    stage_name = 'filter_stage_{i}',
    act_name = 'filter_act_{i}',
    camera_name = 'filter_cam_{i}',
    camera_nose_id = 'hosnoseID{i}',
    play_name = "filter_play_{i}",
    director_date = '11.1{i}.2017',
    director_statuses = [
        'Pending',
        'Error',
        'Error',
        'Pending',
        'Completed'
    ],
    scene_id = "800{i}".repeat(6),
    stage_id = "801{i}".repeat(6),
    act_id = "802{i}".repeat(6),
    act_item_id = "803{i}".repeat(6),
    camera_id = "804{i}".repeat(6),
    play_id = "805{i}".repeat(6),
    play_item_id = "806{i}".repeat(6),
    director_id = "807{i}".repeat(6);
    
    var max_db_save_iter = 5;

    var scenes_list = [],
    stages_list = [],
    acts_list = [],
    act_items_list = [],
    cameras_list = [],
    plays_list = [],
    play_items_list = [],
    directors_list = [];

    describe("Directors getfilters data prepare positive",function(){
        before(()=>{
            for (var i = 0; i<max_db_save_iter; i++){
    
                let scene = new Scene({
                    _id: new mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)),
                    name: scene_name.replace(/{i}/, i),
                })
                scenes_list.push(scene);
                
                let stage = new Stage({
                    _id: new mongoose.Types.ObjectId(stage_id.replace(/{i}/g, i)),
                    name: stage_name.replace(/{i}/, i),
                    ip_address: "88.88.88.88",
                    _index: 0
                })
                stages_list.push(stage);       
                
                let act = new Act({
                    _id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    name: act_name.replace(/{i}/, i),
                    act_items: [new mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i))],

                })
                acts_list.push(act);

                let act_items = new ActItem({
                    _id: new mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i)),
                    act_id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    scene_id: new mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)) ,
                    cameras: [new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i))] 
                })
                act_items_list.push(act_items);

                let camera = new NOSECamera({
                    _id: new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i)),
                    id: camera_nose_id.replace(/{i}/, i),
                    name: camera_name.replace(/{i}/, i),
                })
                cameras_list.push(camera);
                    
                let play = new Play({
                    _id: new mongoose.Types.ObjectId(play_id.replace(/{i}/g, i)),
                    name: play_name.replace(/{i}/, i),
                    play_items: [new mongoose.Types.ObjectId(play_item_id.replace(/{i}/g, i))],
                })
                plays_list.push(play);

                let play_item = new PlayItem({
                    _id: new mongoose.Types.ObjectId(play_item_id.replace(/{i}/g, i)),
                    play_id: new mongoose.Types.ObjectId(play_id.replace(/{i}/g, i)),
                    act_id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i))
                })
                play_items_list.push(play_item);

                let director = new Director({
                    _id: new mongoose.Types.ObjectId(director_id.replace(/{i}/g, i)),
                    launch_status: director_statuses[i],
                    launch_started_at: new Date(director_date.replace(/{i}/, i)),
                    play_id: new mongoose.Types.ObjectId(play_id.replace(/{i}/g, i)),
                    stage_id: new mongoose.Types.ObjectId(stage_id.replace(/{i}/g, i))

                })
                directors_list.push(director);

            }

            return Scene.insertMany(scenes_list)
            .then(()=>{
                return Stage.insertMany(stages_list);               
            }).then(()=>{
                return Act.insertMany(acts_list);               
            }).then(()=>{
                return ActItem.insertMany(act_items_list);               
            }).then(()=>{
                return NOSECamera.insertMany(cameras_list);               
            }).then(()=>{
                return Play.insertMany(plays_list);               
            }).then(()=>{
                return PlayItem.insertMany(play_items_list);               
            }).then(()=>{
                return Director.insertMany(directors_list);               
            }).catch((err)=>{
                console.log(err)
                throw new Error(err);
            })
        });

        after(()=>{
            return Scene.remove({})
            .then(()=>{
                return Stage.remove({});               
            }).then(()=>{
                return Act.remove({});               
            }).then(()=>{
                return ActItem.remove({});               
            }).then(()=>{
                return NOSECamera.remove({});               
            }).then(()=>{
                return Play.remove({});               
            }).then(()=>{
                return PlayItem.remove({});               
            }).then(()=>{
                return Director.remove({});               
            }).catch((err)=>{
                console.log(err)
                throw new Error(err);
            })
        });
        describe("Positive test with all query fields", function(){
            let body = {
                query_play_name: play_name.replace(/{i}/, 0),
                query_camera_name: camera_name.replace(/{i}/, 0),
                query_scene_name: scene_name.replace(/{i}/, 0),
                query_act_name: act_name.replace(/{i}/, 0),
                query_stage_name: stage_name.replace(/{i}/, 0),
                query_date_range: [new Date(director_date.replace(/{i}/, 0)).toISOString(),
                                   new Date(director_date.replace(/{i}/, 0)).toISOString()],
                query_status: director_statuses[0],
            };
            it("Correct statuses", function(done){

                request.post(module_script_root)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    // filter works by "OR" 
                    // len 2 - because of director_statuses[0] == Pending
                    // there are 2 pending directors 
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(2);
                    done(err);
                })
            });
        })
        describe("Positive test with all without fields", function(){
            let body = {};
            it("Correct statuses", function(done){

                request.post(module_script_root)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(5);
                    done(err);
                })
            });
        })
        describe("Positive test with 1 status field", function(){
            let body = {
                query_status: director_statuses[4],
            };
            it("Correct statuses", function(done){

                request.post(module_script_root)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(1);
                    done(err);
                })
            });
        })
    });
});

