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


var base_url = config.testing.apiPrefix;
var module_script_root = '/plays/getfilters';
var url = base_url + module_script_root;


describe("Test /directors/getfilters/:by Directors endpoint", function(){
    
    before(()=>{
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(()=>{
        mongoose.connection.close();
    });

    var scene_name = "getfilters_scene_{i}",
    act_name = 'getfilters_act_{i}',
    stage_name = "getfilters_stage{i}",
    scene_id = "500{i}".repeat(6),
    act_id = "502{i}".repeat(6),
    stage_id = "503{i}".repeat(6);

    var max_db_save_iter = 5;

    var stages_list = [],
    scenes_list = [],
    acts_list = [];


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
                    _index: 0,
                    ip_address: "88.88.88.88"
                })
                stages_list.push(stage);

                let act = new Act({
                    _id: new mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    name: act_name.replace(/{i}/, i),
                })
                acts_list.push(act);
            }

            return Scene.insertMany(scenes_list)
            .then(()=>{
                return Act.insertMany(acts_list);               
            }).then(()=>{
                return Stage.insertMany(stages_list);               
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
                return Stage.remove();               
            }).catch((err)=>{
                console.log(err)
                throw new Error(err);
            })
        });
        
        describe('Positive test for all criterias', function(){
            it("Correct criteria scene check data,statuses", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/scene");

                    expect(res.headers['content-type']).to.match(/json/);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(5);
                    expect(res.body).to.be.all.members([
                        scene_name.replace(/{i}/,0),
                        scene_name.replace(/{i}/,1),
                        scene_name.replace(/{i}/,2),
                        scene_name.replace(/{i}/,3),
                        scene_name.replace(/{i}/,4)
                        ])
                } catch(err){
                    throw new Error(err)
                }
            });
            it("Correct criteria stage check data,statuses", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/stage");

                    expect(res.headers['content-type']).to.match(/json/);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(5);
                    expect(res.body).to.be.all.members([
                        stage_name.replace(/{i}/,0),
                        stage_name.replace(/{i}/,1),
                        stage_name.replace(/{i}/,2),
                        stage_name.replace(/{i}/,3),
                        stage_name.replace(/{i}/,4)
                        ])
                } catch(err){
                    throw new Error(err)
                }
            });
            it("Correct criteria act check data,statuses", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/act");

                    expect(res.headers['content-type']).to.match(/json/);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(5);
                    expect(res.body).to.be.all.members([
                        act_name.replace(/{i}/,0),
                        act_name.replace(/{i}/,1),
                        act_name.replace(/{i}/,2),
                        act_name.replace(/{i}/,3),
                        act_name.replace(/{i}/,4)
                        ])
                } catch(err){
                    throw new Error(err)
                }
            });
        });
        describe('Negative test with wrong URL', function(){
            it("URL without criteria Should have correct Statuses", async ()=>{
                try{
                    let res = await request.get(module_script_root);

                    expect(res.headers['content-type']).to.match(/json/);
                    expect(res.statusCode).to.be.equal(404);
                } catch(err){
                    throw new Error(err)
                }
            });

            it("URL with wrong criteria Should have correct Statuses", async ()=>{
                try{
                    let res = await request.get(module_script_root + "/id");

                    expect(res.headers['content-type']).to.match(/json/);
                    expect(res.statusCode).to.be.equal(500);
                    expect(res.body).to.be.an('object')
                    expect(res.body.result).to.be.equal(false);
                } catch(err){
                    throw new Error(err)
                }
            });
        })
    });
    describe("getfilters Acts GET negative", function(){
        it("Correct criteria scene check data,statuses", async ()=>{
            try{
                let res = await request.get(module_script_root + "/scene");

                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array').and.have.lengthOf(0);
            } catch(err){
                throw new Error(err)
            }
        });
        it("Correct criteria stage check data,statuses", async ()=>{
            try{
                let res = await request.get(module_script_root + "/stage");

                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array').and.have.lengthOf(0);
            } catch(err){
                throw new Error(err)
            }
        });
        it("Correct criteria act check data,statuses", async ()=>{
            try{
                let res = await request.get(module_script_root + "/act");

                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('array').and.have.lengthOf(0);
            } catch(err){
                throw new Error(err)
            }
        });
    });
});

