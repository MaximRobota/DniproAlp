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


describe("Test Create scenes endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });

    describe("Create correct Scene POST",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'list_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'list_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 2
            });
            let scene3 = new Scene({
                name: 'list_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
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

        var new_scene = {};
        var created_scene = {};
        it("Create new correct Scene (4th). Should have 200 status. " +
            "Should have correct content-type in response.", function(done){

            new_scene = {
                name: 'list_scene_4',
                description: 'description_4',
                customer: ['customer_4.1', 'customer_4.2'],
                actor: ['actor_4.1', 'actor_4.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 4
            };
            request.post(module_script_root)
            .send(new_scene)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_scene = res.body;
                done(err);
            })
        });
        it("response should be with created object with the same data", function(done){

            expect(created_scene).to.have.include.keys('name', 'description', 'customer',
                                              'actor', 'snap', 'light_level', 'updated_at',
                                              'created_at', '__v', '_id');
            expect(created_scene.name).to.be.equal(new_scene.name);
            expect(created_scene.description).to.be.equal(new_scene.description);
            expect(created_scene.customer).to.include.ordered.members(new_scene.customer);
            expect(created_scene.actor).to.be.an('array');
            expect(created_scene.snap).to.be.an('object');
            expect(created_scene.light_level).to.be.equal(new_scene.light_level);
            expect(created_scene._id).to.be.a('string');
            expect(created_scene.updated_at).to.be.a('string');
            expect(created_scene.created_at).to.be.a('string');
            done();
        });
        it('Should be list of 4 scenes in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(4);
                done(err);
            })
        });
    });

    describe("Create correct Scene POST with existing name",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'list_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'list_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 2

            });
            let scene3 = new Scene({
                name: 'list_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
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

        var new_scene = {};
        var created_scene = {};
        it("Should have 500 status. " +
            "Should have correct content-type in response. ", function(done){

            new_scene = {
                name: 'list_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 1
            };
            request.post(module_script_root)
            .send(new_scene)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_scene = res.body;
                done(err);
            })
        });
        it("response should be error object with fields", function(done){
            expect(created_scene).to.have.include.keys('result', 'error_details',
                                                   'msg', 'fields');
            expect(created_scene.error_details).to.have.include.keys('error_name',
                                                                 'error_message',);
            expect(created_scene.error_details.error_name).
            to.be.equal("Validation Error");
            expect(created_scene.error_details.error_message).
            to.be.equal("Choose another name");
            done();
        });
        it('Should be list of 3 scenes in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done(err);
            })
        });
    });
    describe("Create Scene POST with nubmer data types. " +
             " Should be converted and created",function(){
        before(function(done){
            let scene1 = new Scene({
                name: 'list_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'list_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 2

            });
            let scene3 = new Scene({
                name: 'list_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
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

        var new_scene = {};
        var created_scene = {};
        it("Should have 200 status. " +
            "Should have correct content-type in response. ", function(done){

            new_scene = {
                name: 'list_scene_5',
                description: 'description_5',
                customer: ['customer_5.1', 'customer_5.2'],
                actor: ['actor_5.1', 'actor_5.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 5
            };
            request.post(module_script_root)
            .send(new_scene)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                created_scene = res.body;
                done(err);
            })
        });
        it("response should be with created object with the same data", function(done){


            expect(created_scene).to.have.include.keys('name', 'description', 'customer',
                'actor', 'snap', 'light_level', 'updated_at',
                'created_at');

            expect(created_scene.name).to.be.equal(new_scene.name.toString(), "name fail");
            expect(created_scene.description).to.be.equal(new_scene.description, "description fail");
            expect(created_scene._id).to.be.a('string');
            expect(created_scene.updated_at).to.be.a('string');
            expect(created_scene.created_at).to.be.a('string');
            done();
        });
        it('Should be list of 4 scenes in response', function(done){
            Scene.find({}, (err, scenes)=>{
                expect(scenes).have.lengthOf(4);
                done();
            });
        });
    });
    describe("Create Scene POST with missing fields",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'list_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'list_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
                light_level    	: 2

            });
            let scene3 = new Scene({
                name: 'list_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                snap: { git_filename : '',
                    git_sha      : ''
                },
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

        var new_scene = {};
        it("Missing optional description and required name", function(done){

            new_scene = {
                description: 'description_4',
                customer: ['customer_4.1', 'customer_4.2'],
                actor: ['actor_4.1', 'actor_4.2']
            };
            request.post(module_script_root)
            .send(new_scene)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.include.keys('result', 'error_details',
                                                       'msg', 'fields');
                expect(res.body.error_details).to.have.include.keys('error_name',
                                                                     'error_message',);
                expect(res.body.result).to.be.equal(false);
                expect(res.body.error_details.error_name).
                to.be.equal("ValidationError");
                expect(res.body.error_details.error_message).
                to.be.equal("Scene validation failed: name: name is required!");
                done(err);
            });
        });

        it('Should be list of 3 scenes in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done(err);
            })
        });
    });
});

