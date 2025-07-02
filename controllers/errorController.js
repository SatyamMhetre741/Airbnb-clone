exports.errorPage = (req, res) => {
    res.status(404).render("404", {pageTitle: "Page Not Found", isLoggedIn: req.session.isLoggedIn});
}

exports.forbiddenPage = (req, res) => {
    res.status(403).render("403", {
        pageTitle: "Access Denied", 
        error: "You do not have permission to access this resource",
        isLoggedIn: req.session.isLoggedIn
    });
}