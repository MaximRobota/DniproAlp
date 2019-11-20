import mongoose from "mongoose";
import '../models/Directors';
import * as db from './DataBaseUtils';

const Scene = mongoose.model('Scene');

/**
 * Filter & Search Scene
 *
 * Examples:
 *
 * Send POST example:
 * {
    "query_name"    		: "2",
    "query_customer"	    : "1",
    "query_actor"	   		: "3",
    "query_no_actor"        : 2,
    "query_light_level" : 3
    }
 */

export function filter(req, res) {

    var response = {};
    //console.log(req.body);

    var query_name = db.escapeRegExp(req.body.query_name);
    var query_customer = db.escapeRegExp(req.body.query_customer);
    var query_actor = db.escapeRegExp(req.body.query_actor);
    var query_no_actor = req.body.query_no_actor || false;
    var query_light_level =parseInt(req.body.query_light_level); //Boolean(req.body.query_light_level**2+1) || false;

    var criteria = new Array();

    if (query_name)     {   criteria.push({name: { "$regex": query_name, "$options": "i" }}); }
    if (query_customer) {   criteria.push({customer: query_customer});    }
    if (query_actor)    {   criteria.push({actor: query_actor});    }
    if (query_light_level){ criteria.push({light_level: parseInt(req.body.query_light_level)});    }
    if (query_no_actor) {   criteria.push({actor : { $size: parseInt(query_no_actor) }});    }

    //console.log(criteria);

    //select all scenes by default
    var query = Scene.find().sort("name");

    //if criteria has conditions execute with "OR" operator
    if(criteria.length > 0) {
        query = Scene.find({ $or : criteria}).sort("name");
    }

    query.exec(function(err, scenes){
        //console.log(scenes);
        if (err) {
            response = db.exceptionMessage(err.name, err.message);
            res.status(500).json(response)
        } else {
            res.json(scenes);
        }
    });
}

/**
 * Get filters by actor|customer|light_level|no-actor
 *
 * Example:
 *
 * /scenes/getfilters/{actor}
 * /scenes/getfilters/{no-actor}
 * /scenes/getfilters/{customer}
 * /scenes/getfilters/{light_level}
 */
export function getfilters(req, res) {

    var response = {}

    var by = req.params.by;
    var criteria = "";

    switch (by) {
        case 'actor':
            criteria = "actor";
            break;
        case 'customer':
            criteria = "customer";
            break;
        case 'light_level':
            criteria = "light_level"
            break;
        case 'no-actor':
            criteria = "no-actor"
            break;
    }

    if(criteria == "") {
        response = {'result': false, 'msg': "Error: wrong filter criteria"};
        res.status(500).json(response);
    } else {
        var query = Scene.find().distinct(criteria);

        if(criteria == 'no-actor') {
            var query = Scene.aggregate(
                { $project: {actor: {$size: '$actor'}}},
                { $group: { //execute 'grouping
                    _id: {number_of_actors: '$actor'}, //using the 'actor' value as the _id
                    count: {$sum: 1} //create a sum value
                }
                },
                { $sort: { count: -1 } } //sorting by 'count' field descending
            );
        }
        query.exec(function(err, scenes){
            //console.log(scenes);
            if (err) {
                response = db.exceptionMessage(err.name, err.message);
                res.status(500).json(response)
            } else {
                res.json(scenes);
            }
        })
    }
}

/**
 * Get the list of Scenes
 *
 * @param req
 * @param res
 */
export function list(req, res) {
    var response = {};
    let skip = req.query.skip ? req.query.skip : 0;
    let limit = req.query.limit ? req.query.limit : 20;
    let sortKey = req.query.sortKey ? req.query.sortKey : 'created_at';
    
    Scene.find(function(err, scene){
        if (err) {
            response = db.exceptionMessage(err.name, err.message);
            res.status(500).json(response)
        } else {
            scene = scene.sort(sort(sortKey)).slice(skip, skip + limit);  
            res.json(scene);
        }
    });

    function sort(key){
        let compareExpression = '';
        return (arg1, arg2) =>{
            
            if(key.search('name') !== -1){
                console.log('sort by name')
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
 * Create Scene
 *
 * @param req
 * @param res
 */
export function create(req, res) {
    var response = {}
    var data = req.body
    var scene = new Scene(data);
    var error = scene.validateSync();

    if (error) {
        // console.log(error);
        response = db.exceptionMessage(error.name, error.message);
        res.status(500).json(response)
    } else {
        //Name uniqueness validation
        Scene.count({name: data.name}, (err, count) => {
            if (err){
                response = db.exceptionMessage(err.name, err.message);
                res.status(500).json(response)
            } else if (!count) {
                scene.save(function(err, scene){
                    if (err) {
                        response = db.exceptionMessage(err.name, err.message, err.errors);
                        res.status(500).json(response)
                    } else {

                        res.json(scene);
                    }
                });
            } else {
                response = db.exceptionMessage(
                    'Validation Error', "Choose another name", {"name":"exist"});
                res.status(500).json(response)
            }
        })
    }
}

/**
 * Update Scene
 *
 * @param req
 * @param res
 */
export function update(req, res) {
    var response = {};
    var id = req.params.id;
    var data = req.body;
    Scene.findById(id, function(err, scene){
        if (err) {
            response = db.exceptionMessage(err.name, err.message);
            res.status(500).json(response)
        } else if (scene) {
            scene.name = data.name || scene.name;
            scene.description = data.description || scene.description;
            scene.services = data.services || scene.services;
            scene.customer = data.customer || scene.customer;
            scene.actor = data.actor || scene.actor;
            scene.snap.git_filename = data.snap.git_filename || scene.snap.git_filename;
            scene.snap.git_sha = data.snap.git_sha || scene.snap.git_sha;
            scene.snap.commands = data.snap.commands || scene.snap.commands;
            scene.light_level = data.light_level || scene.light_level;
            scene.updated_at = Date.now();
            scene.save(function(err, scene){
                if (err) {
                    if (err.code == 11000){
                        response = db.exceptionMessage(
                            'Validation Error', "Choose another name", {"name":"exist"});
                    } else {
                        response = db.exceptionMessage(err.name, err.message, err.errors);
                    }
                    res.status(500).json(response)
                } else {
                    Scene.find(function(err, scenes){
                        res.json(scenes)
                    })
                }
            });
        } else {
            response = db.exceptionMessage('Update error', 'Scene was not found');
            res.status(404).json(response)
        }
    });
}

/**
 * Delete Scene
 *
 * @param req
 * @param res
 */
export async function remove(req, res) {
    var response = {};
    var scene_id = req.params.id;

    try{
        let scene = await Scene.findById(scene_id);
        let removed = await scene.remove();
        if(removed){
            res.json(removed);
        } else {
            res.status(404).json(db.castErrorMessage());
        }
    } catch(err){
        res.status(404).json(db.castErrorMessage());
    }
}