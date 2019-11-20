import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const Scene = mongoose.model('Scene');

let base_url = config.testing.apiPrefix;
let module_script_root = '/scenes';
// let url = base_url + module_script_root;


describe("Test / Scenes endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    describe("List Scenes GET positive",function(){

        before(function(done){
            let scene1 = new Scene({
                name: 'list_scene_1',
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
                name: 'list_scene_2',
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
                name: 'list_scene_3',
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

        let listOfScenes = '';
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
        it('Should be list of 3 scenes in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).have.lengthOf(3);
                done(err);
            })
        });


        it("Checks types of dictionary data in response", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfScenes =  res.body;
                for (let i=0; i<listOfScenes.length; i++){
                    expect(listOfScenes[i].name).to.be.a('string');
                    expect(listOfScenes[i].description).to.be.a('string');
                    expect(listOfScenes[i].customer).to.be.a('array');
                    expect(listOfScenes[i].customer).to.not.be.a('string');
                    expect(listOfScenes[i].actor).to.be.a('array');
                    expect(listOfScenes[i].actor).to.not.be.a('string');
                    expect(listOfScenes[i].snap).to.be.a('object');
                    expect(listOfScenes[i].snap.git_filename).to.be.a('string');
                    expect(listOfScenes[i].snap.git_sha).to.be.a('string');
                    expect(listOfScenes[i].snap.commands).to.be.a('array');
                    expect(listOfScenes[i].light_level).to.be.a('number');
                    expect(listOfScenes[i].light_level).to.not.be.a('string');
                    expect(listOfScenes[i].created_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    });
                    expect(listOfScenes[i].updated_at).to.be.a('string')
                    .and.to.satisfy(function(str){
                        return new Date(str)
                    })
                }
                done(err);
            })
        });
        it("Shouldn't be equal objects in list", function(done){
            request.get(module_script_root)
            .end(function(err, res){
                let listOfScenes =  res.body;
                for (let i=0; i<listOfScenes.length-1; i++){
                    expect(listOfScenes[i]).to.not.be.equal(listOfScenes[i+1])
                }
                expect(Array.from(new Set(listOfScenes))).to.have.lengthOf(listOfScenes.length);
                done(err);
            })
        });
    });
    describe("List Scenes GET negative(no scenes)",function(){

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

