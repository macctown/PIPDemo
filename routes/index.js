/**
 * Controllers (route handlers).
 */
var homeController = require('./home');

module.exports = function(app, logger) {
    /**
     * Primary app routes.
     */
    app.get('/', homeController.home);
    app.get('/initial/hscrb', homeController.inithscrb);
    app.get('/initial/hscrb-members', homeController.inithscrbppl);

    app.get("/lab/add", homeController.addLab);
    app.get("/lab/:labId", homeController.getLab);
    app.post("/lab/edit", homeController.editLab);

    app.get("/person/add", homeController.addPerson);
    app.get("/person/:personId", homeController.getPerson);
    app.post("/person/edit", homeController.editPerson);

    app.get("/demo", homeController.demoStart);

    app.post("/initial/publication/:personId", homeController.initPublication);
};