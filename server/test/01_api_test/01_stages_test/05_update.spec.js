import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const Stage = mongoose.model('Stage');

var base_url = config.testing.apiPrefix;
var module_script_root = '/stages';
var url = base_url + module_script_root;


describe("Test Stages UPDATE endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });
    describe("Correct response on wrong url", function(){
        it('Should have 404 if stages put without ID. /stages/', function(done){
            request.put(module_script_root)
            .expect(404)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end((err, res)=>{
                done(err);
            })
        })
    })
    describe("Update correctly Stage PUT",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'upd_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'upd_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'upd_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Stage.insertMany([stage1, stage2, stage3], ()=>{
                done();
            });
        });

        after(function(done){
            Stage.remove({}, ()=>{
                done();
            });
        });

        var predefined_stage = {};
        var updated_stage = {};
        var update_data = {}
        it('Get first predefined stage. This will be object for comparison', function(done){
            Stage.findOne({name: 'upd_stage_1'}, (err, stage)=>{
                predefined_stage = stage;
                done();
            })
        });

        it("Should update stage correctly", function(done){
            update_data = {
                "name": "upd_new_name",
                "ip_address": "222.111.222.111",
                "_index": 1
            }
            request.put(module_script_root + "/" + predefined_stage._id)
            .send(update_data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){                
                expect(err).to.equal(null);
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(3);
                updated_stage = res.body[0];
                done(err);
            })
        })
    
                
        it("Updated object should contain the same keys", function(done){
            expect(updated_stage).to.be.an('object');
            expect(updated_stage).to.have.include.keys('_index', 'name',
                                                 'description', '_id',
                                                 'created_at', 'updated_at',
                                                 'ip_address');
            done();
        })
        it("Updated object should have updated fields", function(done){
            // Updated data
            expect(updated_stage.name).to.be.equal(update_data.name);
            expect(updated_stage.ip_address).to.be.equal(update_data.ip_address);
            done();
        })    
        it("Updated object should have non-updated fields untouched", function(done){
            // Non-updatedData 
            expect(updated_stage._id).to.be.equal(predefined_stage._id.toString());
            expect(updated_stage._index).to.be.equal(predefined_stage._index);
            expect(updated_stage.description).to
            .be.equal(predefined_stage.description);
            expect(updated_stage.created_at).to
            .be.equal(predefined_stage.created_at.toISOString());

            expect(updated_stage.updated_at).not.to
            .be.equal(predefined_stage.updated_at.toISOString());
            done();
        })
    });

    describe("Update must fail with incorrect ip_address Stage PUT",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'upd_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'upd_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'upd_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Stage.insertMany([stage1, stage2, stage3], ()=>{
                done();
            });
        });

        after(function(done){
            Stage.remove({}, ()=>{
                done();
            });
        });

        var predefined_stage = {};
        var updated_stage = {};
        var update_data = {};

        it('Get first predefined stage. This will be object for comparison', function(done){
            Stage.findOne({name: 'upd_stage_1'}, (err, stage)=>{
                predefined_stage = stage;
                done();
            })
        });

        it("Should not update stage with wrong IP", function(done){
            update_data = {
                "_index": 1,
                "name": "upd_new_name",
                "ip_address": "2222.111.333.232"
            }
            request.put(module_script_root + "/" + predefined_stage._id)
            .send(update_data)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){

                expect(res.body.result).to.be.equal(false);
                expect(res.body.error_details.error_name).
                to.be.equal("ValidationError");
                expect(res.body.error_details.error_message).
                to.be.equal("IP address is not valid");
                done(err);
            })
        })
    
        it("Should not save incorrect update, without _index", function(done){
            update_data = {
                "name": "upd_new_name",
                "ip_address": "222.111.222.111"
            }
            request.put(module_script_root + "/" + predefined_stage._id)
            .send(update_data)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){

                Stage.findOne({name: 'upd_stage_1'},(err, stage)=>{
                    expect(err).to.be.equal(null);
                    expect(stage.name).to.be.equal(predefined_stage.name);
                    expect(stage.ip_address).to.be.equal(predefined_stage.ip_address);
                    expect(stage._id.toString()).to
                    .be.equal(predefined_stage._id.toString());
                    expect(stage._index).to.be.equal(predefined_stage._index);
                    expect(stage.description).to
                    .be.equal(predefined_stage.description);
                    expect(stage.created_at.toISOString()).to
                    .be.equal(predefined_stage.created_at.toISOString());
                    expect(stage.updated_at.toISOString()).to
                    .be.equal(predefined_stage.updated_at.toISOString());
                    done(err);
                })  
            })
        })
    });

    describe("Update must fail with incorrect ID Stage PUT",function(){

        var update_data = {};

        it("Should not update stage", function(done){
            update_data = {
                "_index": 1,
                "name": "upd_new_name",
                "ip_address": "222.111.111.232"
            }
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

    describe("Update must fail with deleted earlier stage PUT",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'upd_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'upd_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'upd_stage_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Stage.insertMany([stage1, stage2, stage3], ()=>{
                done();
            });
        });

        after(function(done){
            Stage.remove({}, ()=>{
                done();
            });
        });

        var predefined_stage = {};
        var updated_stage = {};
        var update_data = {};

        it('Get first predefined stage. This will be object for comparison', function(done){
            Stage.findOne({name: 'upd_stage_1'}, (err, stage)=>{
                predefined_stage = stage;
                stage.remove((del)=>{
                    done();
                })
            })
        });

        it("Should not update deleted stage", function(done){
            update_data = {
                "_index": 1,
                "name": "upd_new_name",
                "ip_address": "222.111.111.232"
            }
            request.put(module_script_root + "/" + predefined_stage._id)
            .send(update_data)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){

                expect(res.body.result).to.be.equal(false);
                expect(res.body.error_details.error_name).
                to.be.equal("Update error");
                expect(res.body.error_details.error_message).
                to.be.equal("Stage was not found");
                done(err);
            })
        })
    
        it("Should be 2 stages in result", function(done){
            Stage.count({}, (err, count) => {
                expect(count).to.be.equal(2);
                done();
            })
        })
    });
});

