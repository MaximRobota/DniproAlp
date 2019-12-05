import mongoose from "mongoose";
// import config from '../etc/config.json';
import '../models/Directors';

export function setUpConnection() {
    mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`);
}

/**
 * Returns error response
 *
 * @param err_name
 * @param err_msg
 * @returns {{msg: string, error_details: {error_name: *, error_message: *}}}
 */
export function exceptionMessage(err_name, err_msg, err_keys={}) {
    var response = {
        "result": false,
        'msg' : 'error',
        'fields' : Object.keys(err_keys),
        'error_details': {
            'error_name': err_name,
            'error_message': err_msg,
        }
    };
    return response
}

export function castErrorMessage() {
    var response = {
        "result": false
        };
    return response
}


/**
 * Like-wise search for name if DB
 * But special characters should be escaped E.g: '/' => '\/' or '?' => '\?'
 * or regex wll fail if '/' will be passed without '\', so '\/'
 *
 * @param str
 * @returns {boolean}
 */
export function escapeRegExp(str) {
    try {
       return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    } catch(e) {
        return false;
    }
}
