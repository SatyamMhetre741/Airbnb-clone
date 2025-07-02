// external modules
const express = require('express');
const userRouter = express.Router();
const storeController = require('../controllers/storeController');

userRouter.get("/", storeController.getIndex);
userRouter.get("/store/home", storeController.getHomes);
userRouter.get("/store/bookings", storeController.getBookings);
userRouter.get("/store/favourites", storeController.getFavList);
userRouter.get("/store/home-details/:homeID", storeController.getHomeDetails);
userRouter.post("/store/booking/:homeID", storeController.postHomeBooking);
userRouter.post("/store/cancel-booking", storeController.postCancelBooking);

// About page route
userRouter.get("/about", storeController.getAbout);

// POST routes for favorites
userRouter.post("/store/add-to-favourites", storeController.postAddToFavourites);
userRouter.post("/store/remove-from-favourites", storeController.postRemoveFromFavourites);

module.exports = userRouter;