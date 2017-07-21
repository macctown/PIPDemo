var winston = require('winston');
var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: process.env.LOG_LEVEL,
            filename: 'utils/log/pip.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true
        }),
        new winston.transports.Console({
            level: 'info',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports=logger;