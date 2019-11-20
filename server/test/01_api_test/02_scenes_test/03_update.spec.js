import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const Scene = mongoose.model('Scene');

var base_url = config.testing.apiPrefix;
var module_script_root = '/scenes';
var url = base_url + module_script_root;


describe("Test Scenes UPDATE endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });
    describe("Correct response on wrong url", function(){
        it('Should have 404 if scenes put without ID. /scenes/', function(done){
            request.put(module_script_root)
            .expect(404)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end((err, res)=>{
                done(err);
            })
        })
    });
    describe("Update correctly Scene PUT",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'upd_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                    "snap": {},
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'upd_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                "snap": {},
                light_level    	: 2

            });
            let scene3 = new Scene({
                name: 'upd_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                "snap": {},
                light_level    	: 3

            });
            Scene.insertMany([scene1, scene2, scene3], ()=>{
                done();
            });
        });

        after(function(done){
            Scene.remove({}, ()=>{
                done();
            });
        });

        var predefined_scene = {};
        var updated_scene = {};
        var update_data = {};
        it('Get first predefined scene. This will be object for comparison', function(done){
            Scene.findOne({name: 'upd_scene_1'}, (err, scene)=>{
                predefined_scene = scene;
                done();
            })
        });

        it("Should update scene correctly", function(done){
            update_data = {
                name: 'upd_new_name',
                description: 'description_1',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                "snap": {},
                light_level    	: 1

            };
            request.put(module_script_root + "/" + predefined_scene._id)
            .send(update_data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){                
                expect(err).to.equal(null);
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(3);
                updated_scene = res.body[0];
                done(err);
            })
        });
    
                
        it("Updated object should contain the same keys", function(done){
            expect(updated_scene).to.be.an('object');
            expect(updated_scene).to.have.include.keys('__v', 'name',
                                                 'description', '_id',
                'customer', 'actor', 'snap', 'light_level',
                                                 'created_at', 'updated_at');
            done();
        });
        it("Updated object should have updated fields", function(done){
            // Updated data
            expect(updated_scene.name).to.be.equal(update_data.name);
            expect(updated_scene.light_level).to.be.equal(update_data.light_level);
            done();
        });
        it("Updated object should have non-updated fields untouched", function(done){
            // Non-updatedData 
            expect(updated_scene._id).to.be.equal(predefined_scene._id.toString());
            expect(updated_scene.light_level).to.be.equal(predefined_scene.light_level);
            expect(updated_scene.description).to
            .be.equal(predefined_scene.description);
            expect(updated_scene.created_at).to
            .be.equal(predefined_scene.created_at.toISOString());

            expect(updated_scene.updated_at).not.to
            .be.equal(predefined_scene.updated_at.toISOString());
            done();
        })
    });

    describe("Update must fail with incorrect light_level Scene PUT",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'upd_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                "snap": {},
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'upd_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                snap: { git_filename : '',
                    git_sha      : '',
                    commands     : []
                },
                light_level    	: 2

            });
            let scene3 = new Scene({
                name: 'upd_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                "snap": {},
                light_level    	: 3

            });
            Scene.insertMany([scene1, scene2, scene3], ()=>{
                done();
            });
        });

        after(function(done){
            Scene.remove({}, ()=>{
                done();
            });
        });

        var predefined_scene = {};
        var updated_scene = {};
        var update_data = {};

        it('Get first predefined scene. This will be object for comparison', function(done){
            Scene.findOne({name: 'upd_scene_1'}, (err, scene)=>{
                predefined_scene = scene;
                done();
            })
        });

        it("Should not update scene with wrong light_level", function(done){
            update_data = {
                "name": "upd_scene_3",
                "description": "description_3",
                "customer": ["customer_3.1", "customer_3.2"],
                "actor": ["actor_3.1", "actor_3.2"],
                "snap": {},
                "light_level"    	: 100
            };
            request.put(module_script_root + "/" + predefined_scene._id)
            .send(update_data)
            .expect('Content-Type', /json/)
                .expect(500)
                .end(function(err, res) {
                    done(err);
                })
            // .expect(500)                                                      // TODO
            // .end(function(err, res){
            //
            //     expect(res.body.result).to.be.equal(false);
            //     expect(res.body.error_details.error_name).
            //     to.be.equal("ValidationError");
            //     expect(res.body.error_details.error_message).
            //     to.be.equal("IP address is not valid");
            //     done();
            // })
        });
    
        it("Should not save incorrect update, without light_level", function(done){
            update_data = {
                name: 'upd_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                "snap": {}
            };
            request.put(module_script_root + "/" + predefined_scene._id)
            .send(update_data)
            .expect('Content-Type', /json/)
                .expect(500)
                .end(function(err, res) {
                    done(err);
                })
            // .expect(500)                                                             // TODO
            // .end(function(err, res){
            //
            //     Scene.findOne({name: 'upd_scene_1'},(err, scene)=>{
            //         expect(err).to.be.equal(null);
            //         expect(scene.name).to.be.equal(predefined_scene.name);
            //         expect(scene.description).to.be.equal(predefined_scene.description);
            //         expect(scene._id.toString()).to
            //         .be.equal(predefined_scene._id.toString());
            //         expect(scene.created_at.toISOString()).to
            //         .be.equal(predefined_scene.created_at.toISOString());
            //         expect(scene.updated_at.toISOString()).to
            //         .be.equal(predefined_scene.updated_at.toISOString());
            //         done();
            //     })
            // })
        })
    });

    describe("Update must fail with incorrect ID Scene PUT",function(){

        var update_data = {};

        it("Should not update scene", function(done){
            update_data = {
                name: 'list_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                "snap": {},
                light_level    	: 3

            };
            request.put(module_script_root + "/" + "SomeIncorrectID")
            .send(update_data)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){

                expect(res.body.result).to.be.equal(false);
                expect(res.body.error_details.error_name).
                to.be.equal("CastError");
                done(err);
            })
        })
    });

    describe("Update must fail with deleted earlier scene PUT",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'upd_scene_1',
                    description: 'description_1',
                    customer: ['customer_1.1', 'customer_1.2'],
                    actor: ['actor_1.1', 'actor_1.2'],
                    "snap": {},
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'upd_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                "snap": {},
                light_level    	: 2

            });
            let scene3 = new Scene({
                name: 'upd_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                "snap": {},
                light_level    	: 3

            });
            Scene.insertMany([scene1, scene2, scene3], ()=>{
                done();
            });
        });

        after(function(done){
            Scene.remove({}, ()=>{
                done();
            });
        });

        var predefined_scene = {};
        var updated_scene = {};
        var update_data = {};

        it('Get first predefined scene. This will be object for comparison', function(done){
            Scene.findOne({name: 'upd_scene_1'}, (err, scene)=>{
                predefined_scene = scene;
                scene.remove((del)=>{
                    done();
                })
            })
        });

        it("Should not update deleted scene", function(done){
            update_data = {
                name: 'list_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                "snap": {},
                light_level    	: 3

            };
            request.put(module_script_root + "/" + predefined_scene._id)
            .send(update_data)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){

                expect(res.body.result).to.be.equal(false);
                expect(res.body.error_details.error_name).
                to.be.equal("Update error");
                expect(res.body.error_details.error_message).
                to.be.equal("Scene was not found");
                done(err);
            })
        });

        it("Should be 2 scenes in result", function(done){
            Scene.count({}, (err, count) => {
                expect(count).to.be.equal(2);
                done();
            })
        })
    });
});

