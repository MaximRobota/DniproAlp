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
const Play = mongoose.model('Play');
const PlayItem = mongoose.model("PlayItem");

var base_url = config.testing.apiPrefix;
var module_script_root = '/plays/save';
var url = base_url + module_script_root;


describe("Test /plays/save/ Play UPDATE endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });

    describe("Correct response on wrong url", function(){
        it('Should have 404 if acts post without ID. /plays/save', async ()=>{
            try{
                let res = await request.post(module_script_root);
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(404);
                expect(res.body).to.be.an('object').and.have.all.keys('result', 'msg');
                expect(res.body.result).to.be.equal(false);
            } catch(err){
                throw new Error(err);
            }
        })
    })

    describe("Save Errors/noSave without data preparation",function(){
        it("Error with incorrect format ID", async ()=>{
            let request_body = {
                "play_id": "SomeIncorrectID"
            };
            try{
                let res = await request.post(module_script_root).send(request_body);

                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(404);
                expect(res.body).to.be.an('object').and.have.all.keys('result');
                expect(res.body.result).to.be.equal(false);
            } catch(err){
                throw new Error(err);
            }

        })

        it("404 Error with non-existing play_id", async ()=>{
            let request_body = {
                play_id: "1".repeat(24)
            }
            try{
                let res = await request.post(module_script_root).send(request_body);
                expect(res.headers['content-type']).to.match(/json/)
                expect(res.statusCode).to.be.equal(404);
            
                expect(res.body).to.be.an('object').and.have.all.keys('result', 'msg');
                expect(res.body.result).to.be.equal(false);
            
            } catch(err){
                throw new Error(err);
            }
        })
    });

    describe("Positive test: create, update on separate elements",function(){
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

        var max_db_save_iter = 3;

        var cameras_list = [],
        scenes_list = [],
        act_items_list = [],
        acts_list = [],
        play_items_list = [],
        plays_list = [];

        before(()=>{
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

                let act_item = new ActItem({
                    _id: new mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i)),
                    act_id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    scene_id: new mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)) ,
                    cameras: [new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i))]

                })
                act_items_list.push(act_item);

                let camera = new NOSECamera({
                    _id: new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i)),
                    id: camera_nose_id.replace(/{i}/, i),
                    name: camera_name.replace(/{i}/, i)
                });
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
        });

        after(()=>{
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
        describe("Create block", function(){

            it('Count objects in DB before request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(3, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });

            it("Should create new PlayItem", async ()=>{
                let i = 0
                //Should create new PlayItem
                let request_body = {
                    create: [{
                            act_id: act_id.replace(/{i}/g, i)
                        }
                    ],
                    play_id: play_id.replace(/{i}/g, i),
                };
        
                try{
                    let res = await request.post(module_script_root)
                              .send(request_body);

                    expect(res.statusCode).to.be.equal(200)
                    expect(res.header["content-type"]).to.match(/json/);
                    
                    
                } catch(e){
                    throw new Error(e);
                }
            })
            it('Count objects in DB after request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(4, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });

        });
        describe("Create + Delete block", function(){
            // 1 PlayItem was created
            it('Count objects in DB before request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(4, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });

            it("Should create new PlayItem and delete one", async ()=>{
                let i = 1
                //Should create new cam and actItem
                let request_body = {
                    create: [{
                            act_id: act_id.replace(/{i}/g, i+1)
                        }
                    ],
                    delete: [play_item_id.replace(/{i}/g, i)],
                    play_id: play_id.replace(/{i}/g, i),
                };
        
                try{
                    let res = await request.post(module_script_root)
                              .send(request_body);

                    expect(res.statusCode).to.be.equal(200)
                    expect(res.header["content-type"]).to.match(/json/);
                    
                    
                } catch(e){
                    throw new Error(e);
                }
            })
            it('Count objects in DB after request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(4, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });
            
        });
        describe("Delete block", function(){
            // 1 PlayItem was created
            it('Count objects in DB before request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(4, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });

            it("Should delete one", async ()=>{
                let i = 2
                //Should create new cam and actItem
                let request_body = {
                    create: [],
                    delete: [play_item_id.replace(/{i}/g, i)],
                    play_id: play_id.replace(/{i}/g, i)
                };
        
                try{
                    let res = await request.post(module_script_root)
                              .send(request_body);

                    expect(res.statusCode).to.be.equal(200)
                    expect(res.header["content-type"]).to.match(/json/);
                    
                    
                } catch(e){
                    throw new Error(e);
                }
            })
            it('Count objects in DB after request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(3, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });
        });
        describe("Do nothing block", function(){
            // 1 PlayItem was created
            it('Count objects in DB before request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(3, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });

            it("Should do nothing", async ()=>{
                let i = 2
                //Should create new cam and actItem
                let request_body = {
                    play_id: play_id.replace(/{i}/g, i),
                };
        
                try{
                    let res = await request.post(module_script_root)
                              .send(request_body);

                    expect(res.statusCode).to.be.equal(200)
                    expect(res.header["content-type"]).to.match(/json/);
                    
                    
                } catch(e){
                    throw new Error(e);
                }
            })
            it('Count objects in DB after request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();
                    let play = await Play.count();
                    let play_item = await PlayItem.count();

                    expect(camera).to.be.equal(3, "Cam");
                    expect(scene).to.be.equal(3, 'Scene');
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                    expect(play_item).to.be.equal(3, "PlayItem");
                    expect(play).to.be.equal(3, "Play");
                } catch(e){
                    throw new Error(e);
                }
            });
            
        });
    });
});

