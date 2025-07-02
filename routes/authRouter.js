// now the router does just the routing work, and the logic part goes to the controller

const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.get("/logout", authController.getLogout);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);

exports.authRouter = authRouter;
