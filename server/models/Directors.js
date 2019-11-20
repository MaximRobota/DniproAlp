import mongoose from "mongoose";


const Schema = mongoose.Schema;

const SceneSchema = new Schema({
    name     		: { type: String, unique:true, required: "{PATH} is required!" },
    description     : { type: String, default: '' },
    customer	    : [ { type: String, default: '' } ],
    actor	   		: [ { type: String, default: '' } ],
    snap            : { git_filename : {type: String, default: ''},
                        git_sha      : {type: String, default: ''},
                        commands     : {type: Array, default: []}
                        },
    light_level    	: { type: Number, default: 0 },
    created_at		: { type: Date, default: Date.now },
    updated_at      : { type: Date, default: Date.now }
});

SceneSchema.index({ _id: 1});

/** Modify hook for cascade delete of ActItems on Scene delete
 *
 */
SceneSchema.pre('remove', async function(next){
    /* 'this' is the scene being removed. Provide callbacks here if you want
     * to be notified of the calls' result.
     * 1 - Remove ActItems related to scene(but trigger ActItems hook)
     */
    var current = this;
    try{
        // 1
        let scene_actItems = await ActItem.find({"scene_id": this._id});
        scene_actItems.forEach((act_item, i, arr)=>{
            act_item.remove();
        })
        next();
    } catch(err){
        console.log(err)
        next(new Error(err));
    }
})

const Scene = mongoose.model('Scene', SceneSchema);
