import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const Director = mongoose.model('Director');
const Play = mongoose.model('Play');
const PlayItem = mongoose.model('PlayItem');
const Act = mongoose.model('Act');
const Scene = mongoose.model('Scene');
const ActItem = mongoose.model('ActItem');
const NOSECamera = mongoose.model('NOSECamera');
const Stage = mongoose.model('Stage');

var base_url = config.testing.apiPrefix;
var module_script_root = '/directors';
var url = base_url + module_script_root;
let director_id = new mongoose.Types.ObjectId("1238".repeat(6));


describe("Test Directors Remove endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });
    describe("Correct response on wrong url", function(){
        it('Should have 404 if directors put without ID. /directors/', function(done){
            request.delete(module_script_root)
            .expect(404)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end((err, res)=>{
                done(err);
            })
        })
    })
    describe("Delete correctly Director DELETE",function(){
        before(()=>{
            let act_id = new mongoose.Types.ObjectId("1231".repeat(6));
            let act_item_id = new mongoose.Types.ObjectId("1232".repeat(6));
            let scene_id = new mongoose.Types.ObjectId("1233".repeat(6));
            let camera_id = new mongoose.Types.ObjectId("1234".repeat(6));
            let play_id = new mongoose.Types.ObjectId("1235".repeat(6));
            let play_item_id = new mongoose.Types.ObjectId("1236".repeat(6));
            let stage_id = new mongoose.Types.ObjectId("1237".repeat(6));
//Scene
            let scene1 = new Scene({
                _id: scene_id,
                name: 'list_act_scene_1',
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

            let camera1 = new NOSECamera({
                _id: camera_id,
                id: "cameraIDFromHOS-NOSE",
                name: "list_act_cam1"
            });
//Act_item
            let act_item1 = new ActItem({
                _id: act_item_id,
                act_id: act_id,
                scene_id: scene_id,
                cameras: [camera_id],
                services: ['service1', 'service2'],
                iterations: 2
            });
//Act
            let act1 = new Act({
                _id: scene_id,
                name: 'list_act_1',
                act_items: [act_item_id]
            });

// Stage
            let stage1 = new Stage({
                _id: stage_id,
                name: 'list_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
// Play
            let play1 = new Play({
                _id: play_id,
                name: "123"
            });
// Play_item
            let play_item1 = new PlayItem({
                _id: play_item_id,
                act_id: act_id,
                play_id: play_id
            });
// Director
            let director1 = new Director({
                _id: director_id,
                _index          : 1,
                play_id         : play_id,
                stage_id        : stage_id,
                launch_status   : 'Pending',
                launch_started_at : new Date().getFullYear() + '-' + ('0' + (new Date().getMonth() + 1)).slice(-2) + '-'  + ('0' + new Date().getDate()).slice(-2) +'T' + ('0' + new Date().getHours()).slice(-2) +':' + ('0' + ( new Date().getMinutes() + 1)).slice(-2),
                launch_gmt_offset : 2
            });

            return act1.save()
            .then(()=>{
                return act_item1.save();
            }).then(()=>{
                return scene1.save();
            }).then(()=>{
                return camera1.save();
            }).then(()=>{
                return stage1.save();
            }).then(()=>{
                return play1.save();
            }).then(()=>{
                return play_item1.save();
            }).then(()=>{
                return director1.save();
            }).catch((err)=>{
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

        it("Should DELETE successfully and return deleted object", async ()=>{
            try{
                let director = await Director.findOne({"_id": director_id}); 
                let id = director_id;
                let res = await request.delete(module_script_root + "/" + id);
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body._id).to.be.equal(director_id.toString());   
                expect(res.body.launch_status).to.be.equal('Pending');
            } catch(err){
                throw new Error(err);
            }
        })
    });

    describe("Remove must fail with incorrect ID Director DELETE", ()=>{
        
        it("Should not delete director", async ()=>{
            try{
                let res = await request.delete(module_script_root + "/" + "SomeIncorrectID");

                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(404);
                expect(res.body.result).to.be.equal(false);
            } catch(err){
                throw new Error(err);
            }
        })
    });



    describe("Remove must fail with deleted earlier director DELETE",function(){
        let director_id = '321{i}'.repeat(6)
        before(function(done){



            let director1 = new Director({
                _id: new mongoose.Types.ObjectId(director_id.replace(/{i}/g, 1)),
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',
                launch_started_at: new Date('11.11.17'),
                launch_status: 'Error',
                stage_id: new mongoose.Types.ObjectId("1".repeat(24)),
                play_id: new mongoose.Types.ObjectId("1".repeat(24)),
            });

            let director2 = new Director({
                _id: new mongoose.Types.ObjectId(director_id.replace(/{i}/g, 2)),
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',
                launch_started_at: new Date('11.11.17'),
                launch_status: 'Error',
                stage_id: new mongoose.Types.ObjectId("1".repeat(24)),
                play_id: new mongoose.Types.ObjectId("1".repeat(24)),
            });
            let director3 = new Director({
                _id: new mongoose.Types.ObjectId(director_id.replace(/{i}/g, 3)),
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',
                launch_started_at: new Date('11.11.17'),
                launch_status: 'Error',
                stage_id: new mongoose.Types.ObjectId("1".repeat(24)),
                play_id: new mongoose.Types.ObjectId("1".repeat(24)),
            });
            Director.insertMany([director1, director2, director3], (err)=>{
                done(err);
            });
        });

        after(function(done){
            Director.remove({}, (err)=>{
                done(err);
            });
        });

        var predefined_director = {};

        it('Get first predefined director. This will be object for comparison', async ()=>{
            try{
                let director = await Director.findOne({_id: director_id.replace(/{i}/g, 1)});
                predefined_director = director;
                let del = await director.remove();

            } catch(err){
                throw new Error(err);
            }
        });

        it("Should not delete deleted director", async ()=>{
            try{
                let res = await request.delete(module_script_root + "/" + predefined_director._id);
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(404);
                expect(res.body.result).to.be.equal(false);

            } catch(err){
                throw new Error(err);
            }
        })

        it("Should be 2 directors in result", async ()=>{
            try{
                let count = await Director.count({});
                expect(count).to.be.equal(2);
            } catch(err){
                throw new Error(err);
            }
        })
    });
});

