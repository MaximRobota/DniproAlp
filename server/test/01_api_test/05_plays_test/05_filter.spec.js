import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;

const NOSECamera = mongoose.model('NOSECamera');
const Scene = mongoose.model('Scene');
const ActItem = mongoose.model('ActItem');
const Act = mongoose.model('Act');
const PlayItem = mongoose.model('PlayItem');
const Play = mongoose.model('Play');


var base_url = config.testing.apiPrefix;
var module_script_root = '/plays/filter';
var url = base_url + module_script_root;


describe("Test /plays/filter Plays endpoint", function(){
    
    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    

    describe("Plays getfilters data prepare positive", function(){
        var scene_name = "filter_scene_{i}",
        act_name = 'filter_act_{i}',
        camera_name = 'filter_cam_{i}',
        camera_nose_id = 'hosnoseId_{i}',
        play_name = "filter_play_{i}",

        camera_id = "504{i}".repeat(6),

        scene_id = "500{i}".repeat(6),
        act_item_id = "503{i}".repeat(6),
        act_id = "502{i}".repeat(6),
        play_item_id = "506{i}".repeat(6),
        play_id = "505{i}".repeat(6);
        
        var max_db_save_iter = 5;

        var cameras_list = [],
        scenes_list = [],
        act_items_list = [],
        acts_list = [],
        play_items_list = [],
        plays_list = [];

        before(function(){
            for (var i = 0; i<max_db_save_iter; i++){
    
                let camera = new NOSECamera({
                    _id: new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i)),
                    id: camera_nose_id.replace(/{i}/, i),
                    name: camera_name.replace(/{i}/, i),
                })
                cameras_list.push(camera);

                let scene = new Scene({
                    _id: new mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)),
                    name: scene_name.replace(/{i}/, i),
                })
                scenes_list.push(scene);
                
                let act_items = new ActItem({
                    _id: new mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i)),
                    act_id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    scene_id: new mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)) ,
                    cameras: [new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i))] 
                })
                act_items_list.push(act_items);
                
                let act = new Act({
                    _id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    name: act_name.replace(/{i}/, i),
                    act_items: [new mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i))],
                })
                acts_list.push(act);

                let play_item = new PlayItem({
                    _id: new mongoose.Types.ObjectId(play_item_id.replace(/{i}/g, i)),
                    play_id: new mongoose.Types.ObjectId(play_id.replace(/{i}/g, i)),
                    act_id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i))
                })
                play_items_list.push(play_item);
                    
                let play = new Play({
                    _id: new mongoose.Types.ObjectId(play_id.replace(/{i}/g, i)),
                    name: play_name.replace(/{i}/, i),
                    play_items: [new mongoose.Types.ObjectId(play_item_id.replace(/{i}/g, i))],
                })
                plays_list.push(play);
            }

            return Scene.insertMany(scenes_list)
            .then(()=>{
                return NOSECamera.insertMany(cameras_list)
            }).then(()=>{
                return ActItem.insertMany(act_items_list);
            }).then(()=>{
                return Act.insertMany(acts_list);
            }).then(()=>{
                return PlayItem.insertMany(play_items_list);
            }).then(()=>{
                return Play.insertMany(plays_list);
            }).catch((err)=>{
                console.log(err)
                throw new Error(err);
            });
        });

        after(function(){
            return NOSECamera.remove()
            .then(()=>{
                return Scene.remove();
            }).then(()=>{
                return ActItem.remove();
            }).then(()=>{
                return Act.remove();
            }).then(()=>{
                return PlayItem.remove();
            }).then(()=>{
                return Play.remove();
            }).catch((err)=>{
                throw new Error(err);
            })
        });

        describe("Positive test with all query fields", function(){
            let body = {
                query_name: play_name.replace(/{i}/, 0),
                query_scene_name: scene_name.replace(/{i}/, 1),
                query_act_name: act_name.replace(/{i}/, 3),
            };
            it("Correct statuses", async ()=>{
                try{
                    let res = await request.post(module_script_root).send(body);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.header["content-type"]).to.match(/json/);
                    expect(res.body).to.be.an('array').and.have.lengthOf(3);
                } catch(e){
                    throw new Error(e);
                }
                
            });
        });
        describe("Positive test with all without fields", function(){
            let body = {};
            it("Correct statuses", async ()=>{
                try{
                    let res = await request.post(module_script_root).send(body);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.header["content-type"]).to.match(/json/);
                    expect(res.body).to.be.an('array').and.have.lengthOf(5);
                } catch(e){
                    throw new Error(e);
                } 
            });
        });
        describe("Positive test with 1 status field", function(){
            let body = {
                query_name: play_name.replace(/{i}/, 0),
            };
            it("Correct statuses", async ()=>{
                try{
                    let res = await request.post(module_script_root).send(body);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.header["content-type"]).to.match(/json/);
                    expect(res.body).to.be.an('array').and.have.lengthOf(1);
                } catch(e){
                    throw new Error(e);
                }    
            });
        });
    });
});

