/**
 * Created by zhangwei on 7/18/17.
 */
var mongoose = require('mongoose');

var topicSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    category: String,
    isActive: {type: Boolean, default: true}
}, { timestamps: true });

var Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;