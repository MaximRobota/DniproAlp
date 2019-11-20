import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;

const DirectorLog = mongoose.model('DirectorLog');

var base_url = config.testing.apiPrefix;
var module_script_root = '/directors/log';
var url = base_url + module_script_root;


describe("Test /director/log Director endpoint", function(){

    before(function(){
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function(){
        mongoose.connection.close()
    });

    describe("Get Director's log GET positive",function(){
        var director_id1 = '',
        director_id2 = '';
        before(function(done){
            director_id1 = new mongoose.Types.ObjectId("1238".repeat(6));
            director_id2 = new mongoose.Types.ObjectId("1239".repeat(6));

            let log11 = {
                director_id : director_id1,
                time: new Date("11.10.2017"),
                level: "INFO",
                log_message : "[INFO/Director] Test log11"
            }
            let log12 = {
                director_id : director_id1,
                time: new Date("11.11.2017"),
                level: "INFO",
                log_message : "[INFO/Director] Test log12"
            }
            let log13 = {
                director_id : director_id1,
                time: new Date("11.12.2017"),
                level: "INFO",
                log_message : "[INFO/Director] Test log13"
            }

            let log21 = {
                director_id : director_id2,
                time: new Date("11.13.2017"),
                level: "INFO",
                log_message : "[INFO/Director] Test log21"
            }
            let log22 = {
                director_id : director_id2,
                time: new Date("11.16.2017"),
                level: "WARNING",
                log_message : "[INFO/Director] Test log22"
            }
            let log23 = {
                director_id : director_id2,
                time: new Date("11.14.2017"),
                level: "INFO",
                log_message : "[INFO/Director] Test log23"
            }
            
            DirectorLog.insertMany([log11, log12, log13, log21, log22, log23], ()=>{
                done();
            })
        });

        after(function(done){
            DirectorLog.remove({}, ()=>{
                done();
            });
        });

        var listOfDirectors = ''
        it("Get 3 logs by id1", function(done){
            request.get(module_script_root + '/' + director_id1)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(3);
                done(err);
            })
        });
        it("Get 1 logs by id1 with skip=0 and limit=1", function(done){
            request.get(module_script_root + '/' + director_id1 + '?skip=0&limit=1')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(1);
                    done(err);
                })
        });
        it("Get 1 logs by id1 with skip=1 and limit=2", function(done){
            request.get(module_script_root + '/' + director_id1 + '?skip=1&limit=2')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.lengthOf(2);
                    done(err);
                })
        });
        it("Get 3 logs by id2", function(done){
            request.get(module_script_root + '/' + director_id2)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(3);
                done(err);
            })
        });
        it("Check keys and values of logs", function(done){
            request.get(module_script_root + '/' + director_id1)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(res.body[0]).to.include.keys(['level', 
                                                     'director_id',
                                                     'log_message']);
                expect(res.body[0].level).to.be.a('string');
                expect(res.body[0].log_message).to.be.a('string');
                expect(res.body[0].director_id).to.be.a('string');
                expect(res.body[0].director_id).to.be.equal(director_id1.toString());
                done(err);
            })
        });
        it("Check keys and values of logs", function(done){
            request.get(module_script_root + '/' + director_id2)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(res.body[0]).to.include.keys(['level', 
                                                     'director_id',
                                                     'log_message']);
                expect(res.body[0].level).to.be.a('string');
                expect(res.body[0].log_message).to.be.a('string');
                expect(res.body[0].director_id).to.be.a('string');
                expect(res.body[0].director_id).to.be.equal(director_id2.toString());
                done(err);
            })
        });
        it("Should be sorted by time field in" + 
           " increasing order in response id1", function(done){
            request.get(module_script_root + '/' + director_id1)
            .end(function(err, res){
                let logs_list = res.body;
                for (var i=0; i<logs_list.length-1; i++){
                    expect(new Date(logs_list[i].time)).to.be.lessThan(new Date(logs_list[i+1].time))
                };
                for (var i=0; i<logs_list.length-1; i++){
                    expect(new Date(logs_list[i].time)).to.not.be.greaterThan(new Date(logs_list[i+1].time))
                };
                done(err);
            })
        });
        it("Should be sorted by time field in" + 
           " increasing order in response id2", function(done){
            request.get(module_script_root + '/' + director_id2)
            .end(function(err, res){
                let logs_list = res.body;
                for (var i=0; i<logs_list.length-1; i++){
                    expect(new Date(logs_list[i].time)).to.be.lessThan(new Date(logs_list[i+1].time))
                };
                for (var i=0; i<logs_list.length-1; i++){
                    expect(new Date(logs_list[i].time)).to.not.be.greaterThan(new Date(logs_list[i+1].time))
                };
                done(err);
            })
        });
    });
    describe("Get Director's log GET negative",function(){

        it("Should be empty list if director has no logs/" +
        " non-existing director_id", function(done){
            request.get(module_script_root + '/' + "1".repeat(24))
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(0);
                done(err);
            })


        });
        it("Invalid director_id", function(done){
            request.get(module_script_root + "/" + 'InvalidID')
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function(err, res){
                done(err);
            })
        });
    });
});

