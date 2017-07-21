/**
 * Created by zhangwei on 4/22/17.
 */
var mongoose = require('mongoose');

var personSchema = new mongoose.Schema({
    name: String,
    homeUrl: String,
    avatar: String,
    title: String,
    email: String,
    phone: String,
    profile: String,
    linkedin: String,
    researchAt: [{type: mongoose.Schema.Types.ObjectId, ref: 'Org'}],
    studyAt: [{type: mongoose.Schema.Types.ObjectId, ref: 'Org'}],
    supervisor: [{type: mongoose.Schema.Types.ObjectId, ref: 'Person'}],
    publication: [{type: mongoose.Schema.Types.ObjectId, ref: 'Publication'}],
    isActive: {type: Boolean, default: true}
}, { timestamps: true });

var Person = mongoose.model('Person', personSchema);

module.exports = Person;