import mongoose from "mongoose";


const Schema = mongoose.Schema;

const ClaimSchema = new Schema({
    fullName: { type: String, required: "{PATH} is required!" },
    phone     		: { type: String, required: "{PATH} is required!" },
    email     		: { type: Number, required: "{PATH} is required!" },
    message     : { type: String, default: '' },
    type     : { type: String, default: '' },
    created_at		: { type: Date, default: Date.now },
    updated_at      : { type: Date, default: Date.now }
});

ClaimSchema.index({ _id: 1});

/** Modify hook for cascade delete of ActItems on Claim delete
 *
 */
ClaimSchema.pre('remove', async function(next){
    /* 'this' is the Claim being removed. Provide callbacks here if you want
     * to be notified of the calls' result.
     * 1 - Remove ActItems related to claim(but trigger ActItems hook)
     */
    var current = this;
    try{
        // 1
        let claim_actItems = await ActItem.find({"claim_id": this._id});
        claim_actItems.forEach((act_item, i, arr)=>{
            act_item.remove();
        });
        next();
    } catch(err){
        console.log(err);
        next(new Error(err));
    }
});

const Claim = mongoose.model('Claim', ClaimSchema);
