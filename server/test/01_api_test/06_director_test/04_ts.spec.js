import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const LogOffset = mongoose.model('LogOffset');

var base_url = config.testing.apiPrefix;
var module_script_root = '/directors/ts';
var url = base_url + module_script_root;


describe("Test latest launch timestamp Director endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    describe("Director ts GET positive",function(){

        before(function(done){
            let ts_id = '4441'.repeat(6)
            let ts = new LogOffset({
                _id: new mongoose.Types.ObjectId(ts_id),
                timestamp: 10000
            });

            ts.save(()=>{
                done();
            })
        });

        after(function(done){
            LogOffset.remove({}, ()=>{
                done();
            })
        });

        it("Should have correct Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /html/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).not.to.equal(404);
                expect(res.statusCode).to.equal(200);
                done(err);
            })
        });
        it('Should be a string convertablle to number in response', function(done){
            request.get(module_script_root)
            .end(function(err, res){
                expect(res.text).to.be.a('string');
                expect(parseInt(res.text)).to.be.equal(10000);
                done(err);
            })
        });

    })
    describe("Director ts GET negative(no timestamp)",function(){

        it("Should have correct Statuses", function(done){
            request.get(module_script_root)
            .expect('Content-Type', /plain/)
            .end(function(err, res){
                expect(err).to.equal(null);
                expect(res.statusCode).not.to.equal(500);
                expect(res.statusCode).to.equal(404);
                done(err);
            })
        });
    })
});

