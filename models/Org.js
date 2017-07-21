/**
 * Created by zhangwei on 4/22/17.
 */
var mongoose = require('mongoose');

var orgSchema = new mongoose.Schema({
    homeUrl: String,
    name: {type: String, unique: true},
    brief: String,
    isActive: {type: Boolean, default: true},
    members:[{type: mongoose.Schema.Types.ObjectId, ref: 'Person'}],
    orgParents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Organization'}],
    type: String
});

var Org = mongoose.model('Org', orgSchema);

module.exports = Org;