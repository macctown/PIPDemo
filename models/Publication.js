/**
 * Created by zhangwei on 7/18/17.
 */
var mongoose = require('mongoose');

var publicationSchema = new mongoose.Schema({
    title: String,
    journal: String,
    publisher: String,
    author: [{type: mongoose.Schema.Types.ObjectId, ref: 'Person'}],
    abstract: String,
    keywords: [{type: mongoose.Schema.Types.ObjectId, ref: 'Topic'}],
    organization: [{type: mongoose.Schema.Types.ObjectId, ref: 'Org'}],
    link: String,
    year: Number,
    citedBy: Number,
    isActive: {type: Boolean, default: true}
}, { timestamps: true });

var Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;