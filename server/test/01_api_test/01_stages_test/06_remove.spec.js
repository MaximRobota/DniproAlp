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
            request.delete(module_script_root)
            .expect(404)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end((err, res)=>{
                done(err);
            })
        })
    })
    describe("Delete correctly Stage DELETE",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'del_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'del_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'del_stage_3',
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

        it("Should DELETE successfully and return deleted object", function(done){
            Stage.findOne({name: 'del_stage_1'}, (err, stage)=>{
                let id = stage._id;
                request.delete(module_script_root + "/" + id)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(err).to.be.equal(null);
                    expect(stage.name).to.be.equal(res.body.name);
                    expect(stage.ip_address).to.be.equal(res.body.ip_address);
                    expect(stage._id.toString()).to
                    .be.equal(res.body._id);
                    expect(stage._index).to.be.equal(res.body._index);
                    expect(stage.description).to
                    .be.equal(res.body.description);
                    expect(stage.created_at.toISOString()).to
                    .be.equal(res.body.created_at);
                    expect(stage.updated_at.toISOString()).to
                    .be.equal(res.body.updated_at);
                    done(err);
                })

            })
        })
    });

    describe("Remove must fail with incorrect ID Stage DELETE",function(){
        it("Should not delete stage", function(done){
            request.delete(module_script_root + "/" + "SomeIncorrectID")
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

   

    describe("Remove must fail with deleted earlier stage DELETE",function(){

        before(function(done){
            let stage1 = new Stage({
                name: 'del_stage_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let stage2 = new Stage({
                name: 'del_stage_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let stage3 = new Stage({
                name: 'del_stage_3',
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

        it('Get first predefined stage. This will be object for comparison', function(done){
            Stage.findOne({name: 'del_stage_1'}, (err, stage)=>{
                predefined_stage = stage;
                stage.remove((del)=>{
                    done();
                })
            })
        });

        it("Should not delete deleted stage", function(done){

            request.delete(module_script_root + "/" + predefined_stage._id)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){

                expect(res.body).to.be.equal(null);
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

