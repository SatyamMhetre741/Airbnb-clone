const path = require('path');

module.exports = path.dirname(require.main.filename);
// the require.main.filename will return the directory 
// where our main entry point of the project is located(app.js)
// in this case, it will return D:\Nodejs\chapter 13 - MVC architecture