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
const ActItem = mongoose.model('ActItem');
const NOSECamera = mongoose.model('NOSECamera');

var base_url = config.testing.apiPrefix;
var module_script_root = '/acts';
var url = base_url + module_script_root;


describe("Test Acts DELETE endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){

        mongoose.connection.close()
    });
    describe("Correct response on wrong url", function(){
        it('Should have 404 if acts put without ID. /acts/', function(done){
            request.delete(module_script_root)
            .expect(404)
            .expect('Content-Type', "text/html; charset=utf-8")
            .end((err, res)=>{
                done(err);
            })
        })
    })
    describe("Delete correctly Act DELETE",function(){

        before(function(done){
            let act1 = new Act({
                name: 'del_act_1'
            });

            let act2 = new Act({
                name: 'del_act_2'
            });
            let act3 = new Act({
                name: 'del_act_3'
            });
            Act.insertMany([act1, act2, act3], ()=>{
                done();
            });
        });

        after(function(done){
            Act.remove({}, ()=>{
                done();
            });
        });

        it("Should DELETE successfully and return empty object", async ()=>{
            try {
                let act = await Act.findOne({name: 'del_act_1'});
                let id = act._id;
                let res = await request.delete(module_script_root + "/" + id);
                expect(res.headers['content-type']).to.match(/json/);
                expect(res.statusCode).to.be.equal(200);
                expect(res.body).to.be.an('object');
                expect(Object.keys(res.body)).to.be.have.lengthOf(0);
            } catch(err) {
                throw new Error(err);
            }
        });
    });

    describe("Remove must fail with incorrect ID Act DELETE",function(){
        it("Should not delete act", function(done){
            request.delete(module_script_root + "/" + "SomeIncorrectID")
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('object').and.have.all.keys('result');
                expect(res.body.result).to.be.equal(false);
                done(err);
            })
        })
    });

   describe("Remove must fail with correct but non-existing ID Act DELETE",function(){
        it("Should not delete act", function(done){
            request.delete(module_script_root + "/" + "1".repeat(24))
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('object').and.have.all.keys('result');
                expect(res.body.result).to.be.equal(false);
                done(err);
            })
        })
    });

    describe("Remove must fail with deleted earlier act DELETE",function(){

        before(function(done){
            let act1 = new Act({
                name: 'del_act_1',
                _index: 1,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });

            let act2 = new Act({
                name: 'del_act_2',
                _index: 2,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            let act3 = new Act({
                name: 'del_act_3',
                _index: 3,
                ip_address: '200.255.220.232',
                description: 'Some description',

            });
            Act.insertMany([act1, act2, act3], ()=>{
                done();
            });
        });

        after(function(done){
            Act.remove({}, ()=>{
                done();
            });
        });

        var predefined_act = {};

        it('Get first predefined act. This will be object for comparison', function(done){
            Act.findOne({name: 'del_act_1'}, (err, act)=>{
                predefined_act = act;
                act.remove((del)=>{
                    done();
                })
            })
        });

        it("Should not delete deleted act", function(done){

            request.delete(module_script_root + "/" + predefined_act._id)
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function(err, res){
                expect(res.body).to.be.an('object').and.have.all.keys('result');
                expect(res.body.result).to.be.equal(false);
                done(err);
            })
        })
    
        it("Should be 2 acts in result", function(done){
            Act.count({}, (err, count) => {
                expect(count).to.be.equal(2);
                done();
            })
        })
    });
});

