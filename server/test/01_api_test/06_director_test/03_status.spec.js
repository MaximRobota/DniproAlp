import chai from "chai";
import mongoose from "mongoose";
import '../../../models/Directors';
import * as config from '../../../etc/config.json';
import app from "../../../app.js";
import supertest from 'supertest';

const request = supertest(app);
const expect = chai.expect;
const Director = mongoose.model('Director');

let base_url = config.testing.apiPrefix;
let module_script_root = '/directors/status';
let url = base_url + module_script_root;
let director_id = new mongoose.Types.ObjectId("1231".repeat(6));


describe("Test / Director endpoint", function() {

    before(function () {
        mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);
    });

    after(function () {
        mongoose.connection.close()
    });

    describe("List Status GET positive", function () {

        before(function (done) {
            let play_id = new mongoose.Types.ObjectId("1235".repeat(6));
            let stage_id = new mongoose.Types.ObjectId("1237".repeat(6));

//Status
            let director = new Director({
                _id: director_id,
                _index: 1,
                play_id: play_id,
                stage_id: stage_id,
                launch_status: 'Pending',
                launch_started_at: new Date().getFullYear() + '-' + ('0' + (new Date().getMonth() + 1)).slice(-2) + '-' + ('0' + new Date().getDate()).slice(-2) + 'T' + ('0' + new Date().getHours()).slice(-2) + ':' + ('0' + ( new Date().getMinutes() + 1)).slice(-2),
                launch_gmt_offset: 2
            });

            director.save(() => {
                done();
            });
        });

        after(function (done) {
            Director.remove({}, () => {
                done();
            });
        });

        it("Should have correct Statuses", function (done) {
            let data = {
                "director_id": director_id,
                "status": "Error"
            };
            request.post(module_script_root)
                .send(data)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).not.to.equal(500);
                    expect(res.statusCode).not.to.equal(404);
                    expect(res.statusCode).to.equal(200);
                    done(err);
                })
        });

        it('Should be list of 1 director in response. check data', function (done) {
            let data = {
                "director_id": director_id,
                "status": "Error"
            };
            request.post(module_script_root)
                .send(data)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    expect(res.body).to.be.an('object');
                    expect(res.body._index).to.be.equal(1);
                    expect(res.body._id).to.be.equal('' + director_id);
                    expect(res.body.play_id).to.be.a('string');
                    expect(res.body.stage_id).to.be.a('string');
                    done(err);
                })
        });

        it("Should have not correct id", function (done) {
            let data = {
                "director_id": 123,
                "status": "Error"
            };
            request.post(module_script_root)
                .send(data)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).not.to.equal(200);
                    expect(res.statusCode).not.to.equal(404);
                    expect(res.statusCode).to.equal(500);
                    done(err);
                })
        });

        it("Should have not correct Statuses", function (done) {
            let data = {
                "director_id": director_id,
                "status": "Error2"
            };
            request.post(module_script_root)
                .send(data)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).not.to.equal(200);
                    expect(res.statusCode).not.to.equal(404);
                    expect(res.statusCode).to.equal(500);
                    done(err);
                })
        });
    })
});