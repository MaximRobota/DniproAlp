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
    describe("Correct response on wrong url", function(){
        it('Should have 404 if acts post without ID. /acts/save', function(done){
            request.post(module_script_root)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('object').and.have.all.keys('result', 'msg');
                expect(res.body.result).to.be.equal(false);
                done(err);
            })
        })
    })

    describe("Save Errors/noSave without data preparation",function(){
        it("Error with incorrect format ID", function(done){
            let request_body = {
                "act_id": "SomeIncorrectID"
            };

            request.post(module_script_root)
            .send(request_body)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('object').and.have.all.keys('result');
                expect(res.body.result).to.be.equal(false);
                done(err);
            })
        })

        it("404 Error with non-existing act/act_id", function(done){
            let request_body = {
                "act_id": "1".repeat(24)
            };

            request.post(module_script_root)
            .send(request_body)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('object').and.have.all.keys('result', 'msg');
                expect(res.body.result).to.be.equal(false);
                done(err);
            });
        });
    });

    describe("Positive test: create, update on separate elements",function(){
        var scene_name = "save_scene_{i}",
        act_name = 'save_act_{i}',
        camera_name = 'save_camera_{i}',

        scene_id = "400{i}".repeat(6),
        camera_id = "401{i}".repeat(6),
        act_id = "402{i}".repeat(6),
        act_item_id = "403{i}".repeat(6),
        customer = "custom{i}",
        service = "service{i}",
        camera_nose_id = 'hosnoseID{i}';

        var max_db_save_iter = 3;

        var scenes_list = [],
        acts_list = [],
        act_items_list = [],
        cameras_list = [];

        before(function(){
            for (var i = 0; i<max_db_save_iter; i++){
    
                let scene = new Scene({
                    _id: new mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)),
                    name: scene_name.replace(/{i}/, i),
                    customer: [customer.replace(/{i}/, i)]
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
                    iterations: i,
                    services: [service.replace(/{i}/, i)],
                    cameras: [new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i))]

                })
                act_items_list.push(act_item);

                let camera = new NOSECamera({
                    _id: new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i)),
                    id: camera_nose_id.replace(/{i}/, i),
                    name: camera_name.replace(/{i}/, i)
                });
                cameras_list.push(camera);
            }

            
            return Scene.insertMany(scenes_list)
            .then(()=>{
                return Act.insertMany(acts_list);
            }).then(()=>{
                return ActItem.insertMany(act_items_list);
            }).then(()=>{
                return NOSECamera.insertMany(cameras_list);
            }).catch((err)=>{
                console.log(err);
            });
        });

        after(()=>{
            return Scene.remove({})
            .then(()=>{
                return Act.remove({});
            }).then(()=>{
                return ActItem.remove({});
            }).then(()=>{
                return NOSECamera.remove({});
            }).catch((err)=>{
                console.log(err);
            });
        });
        describe("Create + Update + Delete block", function(){

            it('Count objects in DB before request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();

                    expect(scene).to.be.equal(3, 'Scene');
                    expect(camera).to.be.equal(3, "Cam");
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                } catch(e){
                    throw new Error(e);
                }
            });

            it("Should create new Cam and actItem", async ()=>{
                let i = 0
                //Should create new cam and actItem
                let request_body = {
                    create: [{
                            scene_id: scene_id.replace(/{i}/g, 1),
                            iterations: 10,
                            services: ['service1', 'service3'],
                            cameras: [
                                {
                                    name: 'newCam',
                                    id: "newID"
                                }
                            ]
                        }
                    ],
                    update: [{
                        _id: act_item_id.replace(/{i}/g, i),
                        iterations: 3,
                        cameras: [
                            {
                                name: camera_name.replace(/{i}/, i),
                                id: camera_id.replace(/{i}/g, i),
                            }
                        ]
                    }],
                    act_id: act_id.replace(/{i}/g, i)
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

                    expect(scene).to.be.equal(3, 'Scene');
                    expect(camera).to.be.equal(4, "Cam");
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(4, "ActItem");
                } catch(e){
                    throw new Error(e);
                }
            });
        });
    });
describe("Positive test: create, update on separate elements",function(){
        var scene_name = "save_scene_{i}",
        act_name = 'save_act_{i}',
        camera_name = 'save_camera_{i}',

        scene_id = "400{i}".repeat(6),
        camera_id = "401{i}".repeat(6),
        act_id = "402{i}".repeat(6),
        act_item_id = "403{i}".repeat(6),
        customer = "custom{i}",
        service = "service{i}",
        camera_nose_id = 'hosnoseID{i}';

        var max_db_save_iter = 3;

        var scenes_list = [],
        acts_list = [],
        act_items_list = [],
        cameras_list = [];

        before(function(){
            for (var i = 0; i<max_db_save_iter; i++){
    
                let scene = new Scene({
                    _id: mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)),
                    name: scene_name.replace(/{i}/, i),
                    customer: [customer.replace(/{i}/, i)]
                });
                scenes_list.push(scene);
                
                let act = new Act({
                    _id: mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    name: act_name.replace(/{i}/, i),
                    act_items: [mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i))],
                })
                acts_list.push(act);

                let act_item = new ActItem({
                    _id: mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i)),
                    act_id: mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    scene_id: mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)) ,
                    iterations: i,
                    services: [service.replace(/{i}/, i)],
                    cameras: [new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i))]
                });
                act_items_list.push(act_item);

                let camera = new NOSECamera({
                    _id: new mongoose.Types.ObjectId(camera_id.replace(/{i}/g, i)),
                    id: camera_nose_id.replace(/{i}/, i),
                    name: camera_name.replace(/{i}/, i)
                });
                cameras_list.push(camera);
            }

            
            return Scene.insertMany(scenes_list)
            .then(()=>{
                return Act.insertMany(acts_list);
            }).then(()=>{
                return ActItem.insertMany(act_items_list);
            }).then(()=>{
                return NOSECamera.insertMany(cameras_list);
            }).catch((err)=>{
                console.log(err);
            });
        });

        after(()=>{
            return Scene.remove({})
            .then(()=>{
                return Act.remove({});
            }).then(()=>{
                return ActItem.remove({});
            }).then(()=>{
                return NOSECamera.remove({});
            }).catch((err)=>{
                console.log(err);
            });
        });
        describe("Create + Delete block", function(){

            it('Count objects in DB before request', async () => {
                try{
                    let scene = await Scene.count();
                    let camera = await NOSECamera.count();
                    let act = await Act.count();
                    let act_item = await ActItem.count();

                    expect(scene).to.be.equal(3, 'Scene');
                    expect(camera).to.be.equal(3, "Cam");
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                } catch(e){
                    throw new Error(e);
                }
            });

            it("Should create new Cam and actItem", async ()=>{
                let i = 0
                //Should create new cam and actItem
                let request_body = {
                    create: [{
                            scene_id: scene_id.replace(/{i}/g, 1),
                            iterations: 10,
                            services: ['service1', 'service3'],
                            cameras: [
                                {
                                    name: 'newCam',
                                    id: "newID"
                                }
                            ]
                        }
                    ],
                    delete: [act_item_id.replace(/{i}/g, i)],
                    act_id: act_id.replace(/{i}/g, i)
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

                    expect(scene).to.be.equal(3, 'Scene');
                    expect(camera).to.be.equal(3, "Cam");
                    expect(act).to.be.equal(3, "Act");
                    expect(act_item).to.be.equal(3, "ActItem");
                } catch(e){
                    throw new Error(e);
                }
            });
        });
    });
});

