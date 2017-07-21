/**
 * Created by zhangwei on 4/22/17.
 */
var mongoose = require('mongoose');
var logger = require('../../utils/log/logger');

var start = function(callback) {
    mongoose.connect(process.env.PIPDB);

    mongoose.connection.on('connected', function() {
        logger.info('MongoDB Connection is Created on : ' + process.env.PIPDB);
    });

    mongoose.connection.on('error', function(err) {
        logger.error('MongoDB Connection Error: ' + err);
        process.exit(1);
    });

    mongoose.connection.on('disconnected', function() {
        logger.error('MongoDB Connection Disconnected. Please make sure that MongoDB is running.');
        process.exit(1);
    });

    callback()
};

module.exports = start;