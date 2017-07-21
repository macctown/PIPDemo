/**
 * Created by zhangwei on 4/28/17.
 */
module.exports = function(req, res, next) {
    if (req.session.donationId) {
        return next();
    }
    req.flash("info", {msg: "Please Start Donate Process From This Page"});
    res.redirect('/donate');
};