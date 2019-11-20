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
const Scene = mongoose.model('Scene');
const ActItem = mongoose.model('ActItem');
const NOSECamera = mongoose.model('NOSECamera');

var base_url = config.testing.apiPrefix;
var module_script_root = '/plays';
var url = base_url + module_script_root;


describe("Test /plays GET endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    describe("List Director GET positive",function(){
        var scene_name = "list_scene_{i}",
        act_name = 'list_act_{i}',
        camera_name = 'list_cam_{i}',
        camera_nose_id = 'hosnoseID{i}',
        play_name = "list_play_{i}",

        scene_id = "500{i}".repeat(6),
        act_id = "502{i}".repeat(6),
        act_item_id = "503{i}".repeat(6),
        camera_id = "504{i}".repeat(6),
        play_id = "505{i}".repeat(6),
        play_item_id = "506{i}".repeat(6);

        var max_db_save_iter = 5;

        var cameras_list = [],
        scenes_list = [],
        act_items_list = [],
        acts_list = [],
        play_items_list = [],
        plays_list = [];

        before(function(){
            for (var i = 0; i<max_db_save_iter; i++){
    
                let scene = new Scene({
                    _id: new mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)),
                    name: scene_name.replace(/{i}/, i),
                })
                scenes_list.push(scene);  
                
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
            }

            return Scene.insertMany(scenes_list)
            .then(()=>{
                return Act.insertMany(acts_list);               
            }).then(()=>{
                return ActItem.insertMany(act_items_list);               
            }).then(()=>{
                return NOSECamera.insertMany(cameras_list);               
            }).then(()=>{
                return Play.insertMany(plays_list);               
            }).then(()=>{
                return PlayItem.insertMany(play_items_list);               
            }).catch((err)=>{
                console.log(err)
                throw new Error(err);
            })
        })

        after(function(){
            return Scene.remove()
            .then(()=>{
                return Act.remove();               
            }).then(()=>{
                return ActItem.remove();               
            }).then(()=>{
                return NOSECamera.remove();               
            }).then(()=>{
                return Play.remove();               
            }).then(()=>{
                return PlayItem.remove();               
            }).catch((err)=>{
                console.log(err)
                throw new Error(err);
            })
        });

        it("Should have correct Statuses", async ()=>{
            try{
                let res = await request.get(module_script_root);
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(200);
            } catch(err) {
                throw new Error(err);
            }
        });
        it('Should be list of 3 plays in response', async ()=>{
            try{
                let res = await request.get(module_script_root);
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(max_db_save_iter);
            } catch(err){
                throw new Error(err);
            }
        });


        it("Checks Play field values and types", async ()=>{
            try{
                let res = await request.get(module_script_root);
                let listOfPlays =  res.body;
                for (let i = 0; i<listOfPlays.length; i++){
                    expect(listOfPlays[i]._id).to.be.a('string')
                    .and.to.be.equal(play_id.replace(/{i}/g, i));

                    expect(listOfPlays[i].name).to.be
                    .equal(play_name.replace(/{i}/, i));

                    expect(listOfPlays[i].created_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return (new Date(str) != "Invalid Date")
                    });
                    expect(listOfPlays[i].updated_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return (new Date(str) != "Invalid Date")
                    })
                };
            } catch(err){
                throw new Error(err);
            }
        });
        it("Checks PlayItems field values and types", async ()=>{
            try{
                let res = await request.get(module_script_root);
                let listOfPlays =  res.body;
                for (let i = 0; i<listOfPlays.length; i++){
                    let play_items = listOfPlays[i].play_items;

                    expect(play_items).to.be.an('array');
                    expect(play_items).to.have.lengthOf(1);
                    expect(play_items[0]).to.be.an('object');
                    expect(play_items[0]._id).to.be.equal(play_item_id.replace(/{i}/g, i));
                };
            } catch(err){
                throw new Error(err);
            }
        });

        it("Checks Act field values and types", async ()=>{
            try{
                let res = await request.get(module_script_root);
                let listOfPlays =  res.body;
                for (let i = 0; i<listOfPlays.length; i++){
                    let iter_act_id = listOfPlays[i].play_items[0].act_id;

                    expect(iter_act_id).to.be.an('object');
                    expect(iter_act_id._id).to.be.equal(act_id.replace(/{i}/g, i));
                    expect(iter_act_id.name).to.be.equal(act_name.replace(/{i}/, i));
                };
            } catch(err){
                throw new Error(err);
            }
        });
        it("Checks ActItems field values and types", async ()=>{
            try{
                let res = await request.get(module_script_root);
                let listOfPlays =  res.body;
                for (let i = 0; i<listOfPlays.length; i++){
                    let act_items = listOfPlays[i].play_items[0].act_id.act_items;

                    expect(act_items).to.be.an('array');
                    expect(act_items).to.have.lengthOf(1);
                    expect(act_items[0]).to.be.an('object');
                    expect(act_items[0]._id).to.be.equal(act_item_id.replace(/{i}/g, i));
                };
            } catch(err){
                throw new Error(err);
            }
        });
        it("Checks Scenes field values and types", async ()=>{
            try{
                let res = await request.get(module_script_root);
                let listOfPlays =  res.body;
                for (let i = 0; i<listOfPlays.length; i++){
                    let iter_scene_id = listOfPlays[i].play_items[0]
                                    .act_id.act_items[0].scene_id;

                    expect(iter_scene_id).to.be.an('object');
                    expect(iter_scene_id._id).to.be.equal(scene_id.replace(/{i}/g, i));
                    expect(iter_scene_id.name).to.be.equal(scene_name.replace(/{i}/, i));
                };
            } catch(err){
                throw new Error(err);
            }
        });

        it("Checks cameras field values and types", async ()=>{
            try{
                let res = await request.get(module_script_root);
                let listOfPlays =  res.body;
                for (let i = 0; i<listOfPlays.length; i++){
                    let cameras = listOfPlays[i].play_items[0]
                                    .act_id.act_items[0].cameras;

                    expect(cameras).to.be.an('array');
                    expect(cameras).to.have.lengthOf(1);
                    expect(cameras[0]).to.be.an('object');
                    expect(cameras[0]._id).to.be.equal(camera_id.replace(/{i}/g, i));
                };
            } catch(err){
                throw new Error(err);
            }
        });
        describe("List 1 Director by Id", ()=>{
            it("Should have correct Statuses", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    expect(res.headers['content-type']).to.match(/json/);
                    expect(res.statusCode).to.be.equal(200);
                } catch(err) {
                    throw new Error(err);
                }
            });
            it('Should be object of 1 play in response', async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    expect(res.body).to.be.an('object');
                } catch(err){
                    throw new Error(err);
                }
            });


            it("Checks Play field values and types", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    let res_play =  res.body;
                    expect(res_play._id).to.be.a('string')
                    .and.to.be.equal(play_id.replace(/{i}/g, 0));

                    expect(res_play.name).to.be
                    .equal(play_name.replace(/{i}/, 0));

                    expect(res_play.created_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return (new Date(str) != "Invalid Date")
                    });
                    expect(res_play.updated_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return (new Date(str) != "Invalid Date")
                    })
                    
                } catch(err){
                    throw new Error(err);
                }
            });
            it("Checks PlayItems field values and types", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    let res_play =  res.body;
                    let play_items = res_play.play_items;

                    expect(play_items).to.be.an('array');
                    expect(play_items).to.have.lengthOf(1);
                    expect(play_items[0]).to.be.an('object');
                    expect(play_items[0]._id).to.be.equal(play_item_id.replace(/{i}/g, 0));
                
                } catch(err){
                    throw new Error(err);
                }
            });

            it("Checks Act field values and types", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    let res_play = res.body;
                    let res_act_id = res_play.play_items[0].act_id;

                    expect(res_act_id).to.be.an('object');
                    expect(res_act_id._id).to.be.equal(act_id.replace(/{i}/g, 0));
                    expect(res_act_id.name).to.be.equal(act_name.replace(/{i}/, 0));
                } catch(err){
                    throw new Error(err);
                }
            });
            it("Checks ActItems field values and types", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    let res_play =  res.body;
                    let act_items = res_play.play_items[0].act_id.act_items;

                    expect(act_items).to.be.an('array');
                    expect(act_items).to.have.lengthOf(1);
                    expect(act_items[0]).to.be.an('object');
                    expect(act_items[0]._id).to.be.equal(act_item_id.replace(/{i}/g, 0));
                } catch(err){
                    throw new Error(err);
                }
            });
            it("Checks Scenes field values and types", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    let res_play =  res.body;
                    let res_scene_id = res_play.play_items[0]
                                    .act_id.act_items[0].scene_id;

                    expect(res_scene_id).to.be.an('object');
                    expect(res_scene_id._id).to.be.equal(scene_id.replace(/{i}/g, 0));
                    expect(res_scene_id.name).to.be.equal(scene_name.replace(/{i}/, 0));
                } catch(err){
                    throw new Error(err);
                }
            });

            it("Checks cameras field values and types", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/" + play_id.replace(/{i}/g, 0));
                    let res_play = res.body;
                    let cameras = res_play.play_items[0]
                                    .act_id.act_items[0].cameras;

                    expect(cameras).to.be.an('array');
                    expect(cameras).to.have.lengthOf(1);
                    expect(cameras[0]).to.be.an('object');
                    expect(cameras[0]._id).to.be.equal(camera_id.replace(/{i}/g, 0));
                } catch(err){
                    throw new Error(err);
                }
            });
        })
    });
    describe("List Director GET negative(no directors)",function(){

        it("Check Statuses and data empty directors", async ()=>{
            try{
                let res = await request.get(module_script_root);
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(0);
            } catch(err){
                    throw new Error(err);
                }
        });

        it("Check Statuses and data for non-existing director", async ()=>{
            try{
                let res = await request.get(module_script_root + "/" + "1".repeat(24));
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(404);
                expect(res.body).to.be.an('object');
            } catch(err){
                    throw new Error(err);
                }
        });
        it("Check Statuses and data for wrongID director", async ()=>{
            try{
                let res = await request.get(module_script_root + "/" + "wrondID");
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(404);
                console.log(res.body)
                expect(res.body).to.be.an('object');
            } catch(err){
                    throw new Error(err);
                }
        });
    });
});

