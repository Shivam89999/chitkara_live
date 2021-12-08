function homePage(req, res) {
    console.log("req.url is ", req.url);
    return res.render("home");
}

module.exports = {
    homePage,
};