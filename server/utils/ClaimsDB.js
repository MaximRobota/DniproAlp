import mongoose from "mongoose";
import '../models/Directors';
import * as db from './DataBaseUtils';

const Claim = mongoose.model('Claim');

/**
 * Get the list of Claims
 *
 * @param req
 * @param res
 */
export function list(req, res) {
    var response = {};
    let skip = req.query.skip ? req.query.skip : 0;
    let limit = req.query.limit ? req.query.limit : 20;
    let sortKey = req.query.sortKey ? req.query.sortKey : 'created_at';
    Claim.find(function(err, claim){
      if (err) {
            response = db.exceptionMessage(err.name, err.message);
            res.status(500).json(response)
        } else {
            claim = claim.sort(sort(sortKey)).slice(skip, skip + limit);
            res.json(claim);
        }
    });

    function sort(key){
        let compareExpression = '';
        return (arg1, arg2) =>{

            if(key.search('name') !== -1){
                compareExpression = key.startsWith('-') ?
                        `arg2['name'].toLowerCase().localeCompare(arg1['name'].toLowerCase())` :
                        `arg1['name'].toLowerCase().localeCompare(arg2['name'].toLowerCase())`;
            }
            else if(key.search('description') !== -1){
                console.log('sort by description')
                compareExpression = key.startsWith('-') ?
                        `arg2['description'].toLowerCase().localeCompare(arg1['description'].toLowerCase())` :
                        `arg1['description'].toLowerCase().localeCompare(arg2['description'].toLowerCase())`;
            }
            else if(key.search('customer') !== -1){
                for (let i = 0; i < arg1['customer'].length; i++) {
                    arg1['customer'] = arg1['customer'].sort((x, y) => x.toLowerCase().localeCompare(y.toLowerCase()));
                }
                for (let i = 0; i < arg2['customer'].length; i++) {
                    arg2['customer'] = arg2['customer'].sort((x, y) => x.toLowerCase().localeCompare(y.toLowerCase()));
                }
                compareExpression = key.startsWith('-') ? (!!arg2['customer'][0] ?
                        `arg2['customer'][0].toLowerCase().localeCompare(arg1['customer'][0] ? arg1['customer'][0].toLowerCase() : '')` : -1) :
                        (!!arg1['customer'][0] ?
                        `arg1['customer'][0].toLowerCase().localeCompare(arg2['customer'][0] ? arg2['customer'][0].toLowerCase() : '')` : -1);
            }
            else if(key.search('actor') !== -1){
                for (let i = 0; i < arg1['actor'].length; i++) {
                    arg1['actor'] = arg1['actor'].sort((x, y) => x.toLowerCase().localeCompare(y.toLowerCase()));
                }
                for (let i = 0; i < arg2['actor'].length; i++) {
                    arg2['actor'] = arg2['actor'].sort((x, y) => x.toLowerCase().localeCompare(y.toLowerCase()));
                }
                compareExpression = key.startsWith('-') ? (!!arg2['actor'][0] ?
                        `arg2['actor'][0].toLowerCase().localeCompare(arg1['actor'][0] ? arg1['actor'][0].toLowerCase() : '')` : -1) :
                        (!!arg1['actor'][0] ?
                        `arg1['actor'][0].toLowerCase().localeCompare(arg2['actor'][0] ? arg2['actor'][0].toLowerCase() : '')` : -1);
            }
            else if(key.search('xml') !== -1){
                compareExpression = key.startsWith('-') ?
                        `arg2['snap']['git_filename'].toLowerCase().localeCompare(arg1['snap']['git_filename'].toLowerCase())` :
                        `arg1['snap']['git_filename'].toLowerCase().localeCompare(arg2['snap']['git_filename'].toLowerCase())`;
            }
            else {
                compareExpression = `Date.parse(arg1['created_at']) > Date.parse(arg2['created_at'])`;
            }
            return eval(compareExpression);
        }
    }
}

/**
 * Create Claim
 *
 * @param req
 * @param res
 */
export function create(req, res) {
    var response = {};
    var data = req.body;
    var claim = new Claim(data);
    var error = claim.validateSync();

    if (error) {
        response = db.exceptionMessage(error.name, error.message);
        res.status(500).json(response)
    } else {
        //Name uniqueness validation
        // Claim.count({name: data.name}, (err, count) => {
        //     if (err){
        //         response = db.exceptionMessage(err.name, err.message);
        //         res.status(500).json(response)
        //     } else if (!count) {
                claim.save(function(err, claim){
                    if (err) {
                        response = db.exceptionMessage(err.name, err.message, err.errors);
                        res.status(500).json(response)
                    } else {
                        res.json(claim);
                    }
                });
            // } else {
            //     response = db.exceptionMessage(
            //         'Validation Error', "Choose another name", {"name":"exist"});
            //     res.status(500).json(response)
            // }
        // })
    }
}

/**
 * Update Claim
 *
 * @param req
 * @param res
 */
export function update(req, res) {
    var response = {};
    var id = req.params.id;
    var data = req.body;
    Claim.findById(id, function(err, claim){
        if (err) {
            response = db.exceptionMessage(err.name, err.message);
            res.status(500).json(response)
        } else if (claim) {
            claim.name = data.name || claim.name;
            claim.description = data.description || claim.description;
            claim.services = data.services || claim.services;
            claim.customer = data.customer || claim.customer;
            claim.actor = data.actor || claim.actor;
            claim.snap.git_filename = data.snap.git_filename || claim.snap.git_filename;
            claim.snap.git_sha = data.snap.git_sha || claim.snap.git_sha;
            claim.snap.commands = data.snap.commands || claim.snap.commands;
            claim.light_level = data.light_level || claim.light_level;
            claim.updated_at = Date.now();
            claim.save(function(err){
                if (err) {
                    if (err.code === 11000){
                        response = db.exceptionMessage(
                            'Validation Error', "Choose another name", {"name":"exist"});
                    } else {
                        response = db.exceptionMessage(err.name, err.message, err.errors);
                    }
                    res.status(500).json(response)
                } else {
                    Claim.find(function(err, claims){
                        res.json(claims)
                    })
                }
            });
        } else {
            response = db.exceptionMessage('Update error', 'Claim was not found');
            res.status(404).json(response)
        }
    });
}

/**
 * Delete Claim
 *
 * @param req
 * @param res
 */
export async function remove(req, res) {
    var claim_id = req.params.id;

    try{
        let claim = await Claim.findById(claim_id);
        let removed = await claim.remove();
        if(removed){
            res.json(removed);
        } else {
            res.status(404).json(db.castErrorMessage());
        }
    } catch(err){
        res.status(404).json(db.castErrorMessage());
    }
}
