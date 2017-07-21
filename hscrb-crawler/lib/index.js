var request = require('request');
var cheerio = require('cheerio');

const baseUrl = 'https://hscrb.harvard.edu/';

module.exports.crawlAllLabsName = function(callback){

    const promise = new Promise(
        function(resolve, reject) {
            request(baseUrl + 'RES-Faculty', function (error, response, html) {
                if(error !== null || response === undefined || response.statusCode != 200) {
                    var errorBuilder = {
                        error: error !== null ? error : "",
                        responseError: response !== undefined ? response.statusCode : ""
                    };
                    reject(errorBuilder);
                }
                else {
                    var urlSet = new Set();
                    var $ = cheerio.load(html);
                    var content = cheerio.load($('#content-panels').html());
                    var labArr = content('.boxes-box-content').toArray();
                    labArr.map(function(lab){
                        var labSec = cheerio.load(lab);
                        var labUrl = labSec('h2 > a').attr('href');
                        if(labUrl !== undefined && labUrl.includes('https://hscrb.harvard.edu/hscrb/')){
                            urlSet.add(labUrl.split('https://hscrb.harvard.edu/hscrb/')[1]);
                        }
                    });
                    resolve(Array.from(urlSet));
                }
            });
        }
    );

    if (typeof callback === 'function') {
        promise.then(
            function(res){
                callback(null, res)
            })
            .catch(callback);
        return null;
    }
    return promise;
};

module.exports.crawlByLabName = function(name, callback){

    const promise = new Promise(
        function(resolve, reject) {
            request(baseUrl + name, function (error, response, html) {
                if(error !== null || response === undefined || response.statusCode != 200) {
                    var errorBuilder = {
                        error: error !== null ? error : "",
                        responseError: response !== undefined ? response.statusCode : ""
                    };
                    reject(errorBuilder);
                }
                else {
                    var result = {};
                    var $ = cheerio.load(html);
                    result['homeUrl'] = baseUrl + name;
                    result['name'] = $('#page-title').text().trim();
                    if($('#content-panels').html() != null ){
                        var content = cheerio.load($('#content-panels').html());
                        result['brief'] = content('#block-os-pages-main-content p').html();
                        resolve(result);
                    }
                    else{
                        return null;
                    }
                }
            });
        }
    );

    if (typeof callback === 'function') {
        promise.then(
            function(res){
                callback(null, res)
            })
            .catch(callback);
        return null;
    }
    return promise;
};

module.exports.crawlPeopleByLabName = function(name, callback){

    const promise = new Promise(
        function(resolve, reject) {
            request(baseUrl + name + "-members", function (error, response, html) {
                if(error !== null || response === undefined || response.statusCode != 200) {
                    var errorBuilder = {
                        error: error !== null ? error : "",
                        responseError: response !== undefined ? response.statusCode : ""
                    };
                    console.log('Error page on: ' + baseUrl + name + "-members");
                    reject(errorBuilder);
                }
                else {
                    var $ = cheerio.load(html);
                    var people = [];
                    $('.modified-in-os_profiles_process_node').toArray().map(function(person){
                        var personItem = {};
                        var personItemHTML = cheerio.load(person);
                        personItem['name'] = personItemHTML('h1 a').text();
                        personItem['avatar'] = personItemHTML('img').attr('src');
                        personItem['title'] = personItemHTML('.field-name-field-professional-title > div > div').text();
                        personItem['email'] = personItemHTML('.field-name-field-email a').text();
                        personItem['phone'] = personItemHTML('.field-name-field-phone > div > div').text();
                        people.push(personItem);
                    });
                    resolve(people);
                }
            });
        }
    );

    if (typeof callback === 'function') {
        promise.then(
            function(res){
                callback(null, res)
            })
            .catch(callback);
        return null;
    }
    return promise;
};