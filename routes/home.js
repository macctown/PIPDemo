/**
 * Created by zhangwei on 4/22/17.
 */
var async = require('async');
var hscrb = require('../hscrb-crawler');
var Org = require('../models/Org');
var Person = require('../models/Person');
var Publication = require('../models/Publication');
var Topic = require('../models/Topic');
var mongoose = require('mongoose');
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "delete250"));
var session = driver.session();
const hscrb_baseUrl = 'https://hscrb.harvard.edu/';

var homeController = {

    home: function(req, res) {

        //retrieve lab and people list
        var findLabs = function(callback) {
            Org.find({}).populate('members').exec(callback);
        };

        var findPeople = function(callback) {
            Person.find({}, callback);
        };

        async.parallel([
                findLabs,
                findPeople
            ],
            function(err, results){
                if(err){
                    console.log(err);
                }
                else{
                    res.render('home', {
                        title: 'Home',
                        success: req.flash("success"),
                        labs: results[0],
                        people: results[1]
                    });
                }
            });
    },

    inithscrb: function (req, res) {

        hscrb.crawlAllLabsName()
            .then(function(labs){

                labs.map(function (lab) {

                    hscrb.crawlByLabName(lab)
                        .then(function(data){

                            var newLab = new Org();
                            newLab.name = data.name;
                            newLab.brief = data.brief;
                            newLab.homeUrl = data.homeUrl;
                            newLab.type = "Lab";

                            newLab.save(function(err, savedLab){
                                if(err){
                                    console.log(savedLab.name + "failed to add to DB! error: " + err.message);
                                }
                                else{
                                    console.log(savedLab.name + "has been added to DB successfully!");
                                }
                            });

                        });

                });
                req.flash('success', {msg:"Retrieve HSCRB lab info successfully！"});
                res.redirect('/');
            });

    },

    inithscrbppl: function(req, res) {

        hscrb.crawlAllLabsName()
            .then(function(labs){

                labs.map(function (lab) {

                    hscrb.crawlPeopleByLabName(lab)
                        .then(function(people){

                            Org.findOne({homeUrl: hscrb_baseUrl + lab}, function(err, resultLab){
                                if(err){
                                   console.log("Can't find lab: " + hscrb_baseUrl + lab);
                                }
                                else{

                                    //save people
                                    people.map(function(person){

                                        var newPerson = new Person();
                                        newPerson.name = person.name.replace(/"/g, "'");
                                        newPerson.avatar = person.avatar;
                                        newPerson.title = person.title;
                                        newPerson.email = person.email;
                                        newPerson.phone = person.phone;
                                        newPerson.researchAt = [resultLab._id];

                                        newPerson.save(function(err, savedPerson){
                                            if(err){
                                                console.log('error occur when save person' + newPerson.name + ' error: ' + err.message);
                                            }
                                            else{
                                                console.log(savedPerson.name + "has been added to DB successfully!");
                                                var query = {"_id" : resultLab._id};
                                                var update = {$push: {"members": mongoose.Types.ObjectId(savedPerson._id)}};
                                                var option = {new: true};
                                                Org.findOneAndUpdate(query, update, option, function(err, result){
                                                    "use strict";
                                                    if(err) {
                                                        console.log('err occur when insert person id '+ savedPerson._id +' into lab '+ resultLab._id);
                                                    }
                                                    else{
                                                        console.log(savedPerson.name + "has been added to "+resultLab.name+" successfully!");
                                                    }
                                                });
                                            }
                                        });

                                    });

                                }
                            });

                        });

                });


                req.flash('success', {msg:"Retrieve HSCRB people info successfully！"});
                res.redirect('/');
            });

    },

    addLab: function(req, res) {
        res.render('newLab', {
            title: 'Add a New Lab'
        });
    },

    addPerson: function(req, res) {
        Org.find({}).exec(function(err, lab) {
            if(err){
                console.log(err);
                req.flash('error', {msg:"Error occurs when retrieve lab info"});
                res.redirect('/');
            }
            else{
                res.render('newPerson', {
                    title: 'Add a New Person',
                    lab: lab
                });
            }
        });
    },

    getLab: function(req, res) {
        Org.findById(req.params.labId)
            .populate('members')
            .exec(function(err, lab) {
            if(err){
                console.log(err);
                req.flash('error', {msg:"Error occurs when retrieve lab"});
                res.redirect('/');
            }
            else{
                console.log(JSON.stringify(lab));
                res.render('editLab', {
                    title: 'Edit Lab',
                    lab: lab,
                    success: req.flash("success"),
                    error: req.flash("error")
                });
            }
        });
    },

    getPerson: function(req, res) {

        //retrieve lab and people list
        var findLabs = function(callback) {
            Org.find({}, callback);
        };

        var findPeople = function(callback) {
            Person.findById(req.params.personId)
                .populate('researchAt')
                .populate('studyAt')
                .populate('supervisor')
                .populate('publication').exec(callback);
        };

        async.parallel([
                findLabs,
                findPeople
            ],
            function(err, results){
                if(err){
                    console.log(err);
                    req.flash('error', {msg:"Error occurs when retrieve person"});
                    res.redirect('/');
                }
                else{
                    console.log(JSON.stringify(results[1]));
                    res.render('editPerson', {
                        title: 'Edit Person',
                        labs: results[0],
                        person: results[1],
                        success: req.flash("success"),
                        error: req.flash("error")
                    });
                }
            });
    },

    editLab: function(req, res) {
        var query = {
            name: req.body.name,
            homeUrl: req.body.homeUrl,
            brief: req.body.brief
        };

        Org.findOneAndUpdate({_id: req.body.id}, query, {upsert:false}, function(err, result){
            if(err) {
                req.flash('errors', {msg:"Error occured when edit lab info"});
            }
            else {
                req.flash('success', {msg:"Successfully edit lab info"});
                //if name is changed, then need to update name in neo4j
                //...
                //...
            }
            res.redirect('/lab/'+req.body.id);
        });
    },

    editPerson: function(req, res) {
        var query = {
            name: req.body.name,
            homeUrl: req.body.homeUrl,
            linkedin: req.body.linkedin,
            phone: req.body.phone,
            email: req.body.email,
            title: req.body.title,
            avatar: req.body.avatar,
            lab: new mongoose.Types.ObjectId(req.body.lab)
        };

        Person.findOneAndUpdate({_id: req.body.id}, query, {upsert:false}, function(err, result){
            if(err) {
                req.flash('errors', {msg:"Error occured when edit person info"});
            }
            else {
                req.flash('success', {msg:"Successfully edit person info"});
                //if name is changed, then need to update name in neo4j
                //...
                //...

                //if lab is changed, then need to update relationship in neo4j
                //...
                //...
            }
            res.redirect('/person/'+req.body.id);
        });
    },


    demoStart: function(req, res) {

        //retrieve lab and people list
        var findLabs = function(callback) {
            Org.find({}, callback);
        };

        var findPeople = function(callback) {
            Person.find({}, callback);
        };

        async.parallel([
                findLabs,
                findPeople
            ],
            function(err, results){
                if(err){
                    console.log(err);
                }
                else{

                    var relationship = 'MATCH p=()-[r:RESEARCH_AT]->() RETURN p';
                    session.run(relationship)
                        .then(function (nodeRes) {
                            var linkDataArray = [];
                            nodeRes['records'].map(function(node){
                                var linkDataItem = {};
                                linkDataItem['from'] = node['_fields'][0].start.properties['mg_id'];
                                linkDataItem['to'] = node['_fields'][0].end.properties['mg_id'];
                                linkDataItem['text'] = node['_fields'][0]['segments'][0].relationship['type'];
                                linkDataArray.push(linkDataItem);
                            });
                            var nodesList = 'match (n) where n:Lab or n:Person return n;';
                            session.run(nodesList)
                                .then(function (nodes) {
                                    var nodeDataArray = [];
                                    nodes['records'].map(function(node){
                                        var nodeDataItem = {};
                                        nodeDataItem['key'] = node['_fields'][0].properties['mg_id'];
                                        nodeDataItem['text'] = node['_fields'][0].properties['name'];
                                        nodeDataItem['label'] = node['_fields'][0]['labels'][0];
                                        nodeDataItem['color'] = nodeDataItem['label'] === "Lab" ? "Orange" : "Gray";
                                        nodeDataArray.push(nodeDataItem);
                                    });
                                    res.render('demo', {
                                        title: 'Demo',
                                        linkDataArray: JSON.stringify(linkDataArray),
                                        nodeDataArray: JSON.stringify(nodeDataArray),
                                        labs: JSON.stringify(results[0]),
                                        people: JSON.stringify(results[1])
                                    });
                                })
                                .catch(function (error) {
                                    console.log("error occured when retrieving node");
                                    console.log(error);
                                });
                        })
                        .catch(function (error) {
                            console.log("error occured when retrieving node");
                            console.log(error);
                        });
                }
            });
    },

    initPublication: function (req, res) {

        hscrb.crawlGoogleScholarPage(req.body.profile)
            .then(function(data){

                data.map(function (publicationProfile) {

                    hscrb.crawlGoogleScholarPublicationPage(publicationProfile)
                        .then(function(publication){

                            var newPublication = new Publication();
                            newPublication.title = publication.title;
                            newPublication.link = publication.link;
                            newPublication.journal = publication.journal;
                            newPublication.publisher = publication.publisher;
                            newPublication.abstract = publication.abstract;
                            newPublication.year = publication.year;
                            newPublication.author = new mongoose.Types.ObjectId(req.params.personId);


                            newPublication.save(function(err, savedPublication){
                                "use strict";
                                if(err){
                                    console.log('error occur when save publication' + newPublication.name + ' error: ' + err.message);
                                }
                                else{
                                    console.log(newPublication.title + " has been added to DB successfully!");
                                    var query = {"_id" : new mongoose.Types.ObjectId(req.params.personId)};
                                    var update = {$push: {"publication": mongoose.Types.ObjectId(savedPublication._id)}};
                                    var option = {new: true};
                                    Person.findOneAndUpdate(query, update, option, function(err, result){
                                        "use strict";
                                        if(err) {
                                            console.log('err occur when insert publication id '+ savedPublication._id +' into lab '+ req.params.personId);
                                        }
                                        else{
                                            console.log(newPublication.title + "has been added to "+req.params.personId+" successfully!");
                                        }
                                    });
                                }
                            })

                        })
                        .catch(function(err){
                            "use strict";
                            console.log(err);
                        });
                })
            })
            .catch(function(err){
                "use strict";
                console.log(err);
            });

    }

};

module.exports = homeController;