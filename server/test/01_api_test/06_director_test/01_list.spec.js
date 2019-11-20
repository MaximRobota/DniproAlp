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


describe("Test / Director endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    describe("List Director GET positive",function(){

        before(function(done){
            let act_id = new mongoose.Types.ObjectId("1231".repeat(6));
            let act_item_id = new mongoose.Types.ObjectId("1232".repeat(6));
            let scene_id = new mongoose.Types.ObjectId("1233".repeat(6));
            let camera_id = new mongoose.Types.ObjectId("1234".repeat(6));
            let play_id = new mongoose.Types.ObjectId("1235".repeat(6));
            let play_item_id = new mongoose.Types.ObjectId("1236".repeat(6));
            let stage_id = new mongoose.Types.ObjectId("1237".repeat(6));
            let director_id = new mongoose.Types.ObjectId("1238".repeat(6));
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
                _id: act_id,
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
            let play_item1 = new ActItem({
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

            act1.save(()=>{
                act_item1.save(()=>{
                    scene1.save(()=>{
                        camera1.save(()=>{
                            stage1.save(()=>{
                                play1.save(() =>{
                                    play_item1.save(() =>{
                                        director1.save(() =>{
                                            done();
                                        });
                                    });
                                });
                            });
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

        var listOfDirectors = ''
        it("Should have correct Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).not.to.equal(404);
                expect(res.statusCode).to.equal(200);
                done(err);
            })
        });
        it('Should be list of 1 directors in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(1);
                done(err);
            })
        });
        it('Should be list of 1 directors with ?skip=0&limit=1 in response', function(done){
            request.get(module_script_root + '?skip=0&limit=1')
                .end(function(err, res){
                    expect(res.body).to.be.an('array');
                    expect(res.body).have.lengthOf(1);
                    done(err);
                })
        });

        it("Checks types of dictionary data in response", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfDirectors =  res.body;
                for (let i = 0; i<listOfDirectors.length; i++){
                    expect(listOfDirectors[i].play_id).to.be.a('object');
                    expect(listOfDirectors[i].play_id.name).to.be.equal('123');
                    expect(listOfDirectors[i].stage_id).to.be.a('object');
                    expect(listOfDirectors[i]._index).to.be.a('number');
                    expect(listOfDirectors[i]._index).to.not.be.a('string');
                    expect(listOfDirectors[i].created_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    });
                    expect(listOfDirectors[i].updated_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    })
                };
                done(err);
            })
        });
    });
    describe("List Director GET negative(no directors)",function(){

        it("Check Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.be.equal(500);
                expect(res.statusCode).not.to.be.equal(404);
                expect(res.statusCode).to.be.equal(200);
                done(err);
            })
        });
        it("Type of response", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.not.be.an('object');
                expect(res.body).to.not.be.an('string');
                expect(res.body).to.be.a('array');
                done(err);
            })

        });

        it('Checks for empty list in parsed JSON from res.body', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.not.have.lengthOf.greaterThan(0);
                expect(res.body).to.have.lengthOf(0);
                done(err);
            })
        });
    });
});

