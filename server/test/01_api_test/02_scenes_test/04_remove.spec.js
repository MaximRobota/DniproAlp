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


describe("Test Scenes DELETE endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });
    describe("Correct response on wrong url", function(){
        it('Should have 404 if scenes put without ID. /scenes/', function(done){
            request.delete(module_script_root)
            .expect(404)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end((err, res)=>{
                done(err);
            })
        })
    });
    describe("Delete correctly Scene DELETE",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'del_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                snap: { git_filename : '',
                    git_sha      : '',
                    commands     : []
                },
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'del_scene_2',
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
                name: 'del_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                snap: { git_filename : '',
                    git_sha      : '',
                    commands     : []
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

        it("Should DELETE successfully and return Null", function(done){
            Scene.findOne({name: 'del_scene_1'}, (err, scene)=>{
                let id = scene._id;
                request.delete(module_script_root + "/" + id)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an("object");
                    expect(res.body._id).to.be.equal(id.toString());
                    done(err);
                })

            })
        })
    });

    describe("Remove must fail with incorrect ID Scene DELETE", function(){
        it("Should not delete scene", async ()=>{
            try{
                let res = await request.delete(module_script_root + "/" + "SomeIncorrectID")
                expect(res.statusCode).to.be.equal(404);
                expect(res.header["content-type"]).to.match(/json/);
                expect(res.body.result).to.be.equal(false);
            } catch (e){
                throw new Error(e);
            }
        })
    });

   

    describe("Remove must fail with deleted earlier scene DELETE",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'del_scene_1',
                description: 'description_1',
                customer: ['customer_1.1', 'customer_1.2'],
                actor: ['actor_1.1', 'actor_1.2'],
                snap: {},
                light_level    	: 1
            });

            let scene2 = new Scene({
                name: 'del_scene_2',
                description: 'description_2',
                customer: ['customer_2.1', 'customer_2.2'],
                actor: ['actor_2.1', 'actor_2.2'],
                snap: {},
                light_level    	: 2

            });
            let scene3 = new Scene({
                name: 'del_scene_3',
                description: 'description_3',
                customer: ['customer_3.1', 'customer_3.2'],
                actor: ['actor_3.1', 'actor_3.2'],
                snap: {},
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

        it('Get first predefined scene. This will be object for comparison', function(done){
            Scene.findOne({name: 'del_scene_1'}, (err, scene)=>{
                predefined_scene = scene;
                scene.remove((del)=>{
                    done();
                })
            })
        });

        // it("Should not delete deleted scene", function(done){                              // TODO
        //
        //     request.delete(module_script_root + "/" + predefined_scene._id)
        //     .expect('Content-Type', /json/)
        //     .expect(200)
        //     .end(function(err, res){
        //         console.log(res.body);
        //         expect(res.body).to.be.equal(null);
        //         done();
        //     })
        // })
    
        it("Should be 2 scenes in result", function(done){
            Scene.count({}, (err, count) => {
                expect(count).to.be.equal(2);
                done();
            })
        })
    });
});

