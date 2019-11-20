import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;

const Act = mongoose.model('Act');
const Scene = mongoose.model('Scene');;
const ActItem = mongoose.model('ActItem');

var base_url = config.testing.apiPrefix;
var module_script_root = '/acts/filter';
var url = base_url + module_script_root;


describe("Test /acts/filter Acts endpoint", function(){
    
    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });
    var scene_name = "filter_scene_{i}",
    act_name = 'filter_act_{i}',

    scene_id = "800{i}".repeat(6),
    act_id = "802{i}".repeat(6),
    act_item_id = "803{i}".repeat(6),
    customer = "custom{i}",
    service = "service{i}";

    var max_db_save_iter = 5;

    var scenes_list = [],
    acts_list = [],
    act_items_list = [];

    describe("Acts getfilters data prepare positive", function(){
        before(function(done){
            for (var i = 0; i<max_db_save_iter; i++){
    
                let scene = {
                    _id: mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)),
                    name: scene_name.replace(/{i}/, i),
                    customer: [customer.replace(/{i}/, i)]
                }
                scenes_list.push(scene);
                
                let act = {
                    _id: mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    name: act_name.replace(/{i}/, i),
                    act_items: [mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i))],
                }
                acts_list.push(act);

                let act_items = {
                    _id: mongoose.Types.ObjectId(act_item_id.replace(/{i}/g, i)),
                    act_id: mongoose.Types.ObjectId(act_id.replace(/{i}/g, i)),
                    scene_id: mongoose.Types.ObjectId(scene_id.replace(/{i}/g, i)) ,
                    iterations: i,
                    services: [service.replace(/{i}/, i)] 

                }
                act_items_list.push(act_items);
            }

            
            Scene.collection.insert(scenes_list,()=>{
                Act.collection.insert(acts_list,()=>{
                    ActItem.collection.insert(act_items_list, ()=>{
                        done();            
                    })
                })

            });
        });

        after(function(done){
            
            Scene.remove({}, ()=>{
                Act.remove({}, ()=>{
                    ActItem.remove({}, ()=>{
                        done();
                    });
                })
            });
        });
        describe("Positive test with all query fields", function(){
            let body = {
                query_name: act_name.replace(/{i}/, 0),
                query_scene: scene_name.replace(/{i}/, 0),
                query_customer: customer.replace(/{i}/, 0),
                query_services: service.replace(/{i}/, 0),
                query_iterations: 0,

            };
            it("Correct statuses", function(done){

                request.post(module_script_root)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(1);
                    done(err);
                })
            });
        })
        describe("Positive test with all without fields", function(){
            let body = {};
            it("Correct statuses", function(done){

                request.post(module_script_root)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(5);
                    done(err);
                })
            });
        })
        describe("Positive test with 1 status field", function(){
            let body = {
                query_name: act_name.replace(/{i}/, 0),
            };
            it("Correct statuses", function(done){

                request.post(module_script_root)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array').and.have
                    .lengthOf(1);
                    done(err);
                })
            });
        })
    });
});

