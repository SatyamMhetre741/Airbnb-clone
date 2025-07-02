// Using the Home, Favourite, and Booking models for data operations
const Home = require('../models/homes');
const Favourite = require('../models/favourites');
const User = require('../models/user');
const Booking = require('../models/booking');
const bookingUtils = require('../util/bookingUtils');

exports.getHomes = (req, res, next) => { 
    // First update booking status to ensure homes are properly marked as available/unavailable
    bookingUtils.updateBookingStatus()
        .then(() => {
            return Home.find();
        })
        .then(homes => {
            // Ensure MongoDB ObjectIds are converted to strings for the template
            const homesWithStringIds = homes.map(home => {
                const homeObj = home.toObject();
                homeObj._id = homeObj._id.toString();
                
                // Ensure photoUrl is valid
                if (!homeObj.photoUrl || homeObj.photoUrl.trim() === '') {
                    homeObj.photoUrl = '/images/placeholder-house.jpg';
                }
                
                return homeObj;
            });
            
            res.render("store/home", { 
                homes: homesWithStringIds, 
                pageTitle: "Airbnb Home", 
                isLoggedIn: req.session.isLoggedIn,
                userType: req.session.userType
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to fetch homes' , isLoggedIn: req.session.isLoggedIn, userType: req.session.userType
            });
        });
};

exports.Homeslist = (req, res, next) => { 
    Home.find()
        .then(homes => {
            // Ensure MongoDB ObjectIds are converted to strings for the template
            const homesWithStringIds = homes.map(home => {
                const homeObj = home.toObject();
                homeObj._id = homeObj._id.toString();
                
                // Ensure photoUrl is valid
                if (!homeObj.photoUrl || homeObj.photoUrl.trim() === '') {
                    homeObj.photoUrl = '/images/placeholder-house.jpg';
                }
                
                return homeObj;
            });
            
            res.render("store/home-list", { 
                homes: homesWithStringIds, 
                pageTitle: "Homes-list", 
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to fetch homes list' , isLoggedIn: req.session.isLoggedIn
            });
        });
};

exports.getIndex = (req, res, next) => {
    // getting the homes data from the Home model
    // here the fetchAll method returns a promise
    Home.find()
        .then(homes => {
            // Ensure MongoDB ObjectIds are converted to strings for the template
            const homesWithStringIds = homes.map(home => {
                const homeObj = home.toObject();
                homeObj._id = homeObj._id.toString();
                return homeObj;
            });

            res.render("Index", {
                homes: homesWithStringIds,
                pageTitle: "Index" , isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to fetch homes for index' , isLoggedIn: req.session.isLoggedIn
            });
        });
};
 
exports.getBookings = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const userId = req.session.user.userId;

    Booking.find({ userId: userId })
        .populate('homeId') // Populate the homeId field with Home documents
        .then(bookings => {
            // Map the bookings to extract the home data and booking details
            const bookingsWithDetails = bookings
                .filter(booking => booking.homeId) // Filter out any null homeIds
                .map(booking => {
                    const bookingObj = booking.toObject();
                    bookingObj.home = booking.homeId.toObject();
                    bookingObj.home._id = bookingObj.home._id.toString(); // Convert ObjectId to string
                    bookingObj._id = bookingObj._id.toString(); // Convert booking ObjectId to string
                    
                    // Format dates for display
                    bookingObj.formattedCheckInDate = new Date(bookingObj.checkInDate).toLocaleDateString('en-GB');
                    bookingObj.formattedCheckOutDate = new Date(bookingObj.checkOutDate).toLocaleDateString('en-GB');
                    
                    // Ensure photoUrl is valid
                    if (!bookingObj.home.photoUrl || bookingObj.home.photoUrl.trim() === '') {
                        bookingObj.home.photoUrl = '/images/placeholder-house.jpg';
                    }
                    
                    return bookingObj;
                });

            res.render("store/bookings", { 
                bookings: bookingsWithDetails, 
                hasBookings: bookingsWithDetails.length > 0,
                pageTitle: "Your Bookings", 
                isLoggedIn: req.session.isLoggedIn,
                userType: req.session.userType
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to fetch bookings', 
                isLoggedIn: req.session.isLoggedIn,
                userType: req.session.userType
            });
        });
};

exports.getHomeDetails = (req, res, next) => {
    const homeId = req.params.homeID;
    const isLoggedIn = req.session.isLoggedIn;
    
    // First update booking status to ensure home availability is current
    bookingUtils.updateBookingStatus()
        .then(() => {
            // We need two promises, one to get the home, one to check if it's a favorite
            let homeData;
            
            return Home.findById(homeId)
                .then(home => {
                    if (!home) {
                        throw new Error('Home not found');
                    }
                    
                    // Ensure the ObjectId is properly stringified for the template
                    homeData = home.toObject();
                    homeData._id = homeData._id.toString();
                    
                    // Ensure photoUrl is valid
                    if (!homeData.photoUrl || homeData.photoUrl.trim() === '') {
                        homeData.photoUrl = '/images/placeholder-house.jpg';
                    }

                    // Check if home is in user's favorites, only if logged in
                    if (isLoggedIn) {
                        const userId = req.session.user.userId;
                        return Favourite.findOne({ homeId: homeData._id, userId: userId })
                            .then(isFavourite => {
                                res.render('store/home-details', { 
                                    home: homeData,
                                    pageTitle: homeData.houseName,
                                    isFavourite: !!isFavourite, 
                                    isLoggedIn: isLoggedIn,
                                    userType: req.session.userType
                                });
                            });
                    } else {
                        res.render('store/home-details', { 
                            home: homeData,
                            pageTitle: homeData.houseName,
                            isFavourite: false, 
                            isLoggedIn: isLoggedIn,
                            userType: req.session.userType
                        });
                    }
                });
        })
        .catch(err => {
            console.error('Database error:', err);
            if (err.message === 'Home not found') {
                res.status(404).render('404', { 
                    pageTitle: 'Home Not Found',
                    isLoggedIn: isLoggedIn
                });
            } else {
                res.status(500).render('500', { 
                    pageTitle: 'Error', 
                    error: 'Failed to fetch home details',
                    isLoggedIn: isLoggedIn
                });
            }
        });
};

exports.postAddToFavourites = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    
    const homeId = req.body.homeId;
    const userId = req.session.user.userId;

    const favourite = new Favourite({ 
        homeId: homeId, 
        userId: userId 
    });

    favourite.save()
        .then(result => {
            res.redirect('/store/favourites');
        }) 
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to add home to favorites', isLoggedIn: req.session.isLoggedIn 
            });
        });
};

exports.postRemoveFromFavourites = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    
    const homeId = req.body.homeId;
    const userId = req.session.user.userId;
    
    Favourite.findOneAndDelete({ homeId: homeId, userId: userId })
        .then(result => {
            if (result) {
                res.redirect('/store/favourites');
            } else {
                throw new Error('Failed to remove from favorites');
            }
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to remove home from favorites',
                isLoggedIn: req.session.isLoggedIn
            });
        });
};

exports.getFavList = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const userId = req.session.user.userId;

    Favourite.find({ userId: userId })
        .populate('homeId') // Populate the homeId field with Home documents
        .then(favourites => {
            // Map the favourites to extract the home data
            const homesWithStringIds = favourites
                .filter(fav => fav.homeId) // Filter out any null homeIds
                .map(fav => {
                    const home = fav.homeId.toObject();
                    home._id = home._id.toString(); // Convert ObjectId to string
                    return home;
                });
            if (homesWithStringIds.length === 0) {
                return res.render('store/favourites', { 
                    homes: [], 
                    pageTitle: "My Favorites", 
                    isLoggedIn: req.session.isLoggedIn
                });
            }
            res.render("store/favourites", { 
                homes: homesWithStringIds, 
                pageTitle: "My Favorites", 
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to fetch favorites', 
                isLoggedIn: req.session.isLoggedIn
            });
        });
};

exports.getAbout = (req, res) => {
    res.render("about", { 
        pageTitle: "About AirBnB Clone", 
        isLoggedIn: req.session.isLoggedIn
    });
};

exports.postHomeBooking = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const homeId = req.params.homeID;
    const userId = req.session.user.userId;
    const checkInDate = new Date(req.body.checkInDate);
    const checkOutDate = new Date(req.body.checkOutDate);
    const currentDate = new Date();
    
    // Reset time portion for fair comparison
    currentDate.setHours(0, 0, 0, 0);
    
    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return res.status(400).render('error', { 
            pageTitle: 'Invalid Date', 
            error: 'Invalid date format', 
            isLoggedIn: req.session.isLoggedIn,
            userType: req.session.userType
        });
    }
    
    if (checkInDate < currentDate) {
        return res.status(400).render('error', { 
            pageTitle: 'Invalid Date', 
            error: 'Check-in date cannot be in the past', 
            isLoggedIn: req.session.isLoggedIn,
            userType: req.session.userType
        });
    }
    
    if (checkInDate >= checkOutDate) {
        return res.status(400).render('error', { 
            pageTitle: 'Invalid Date', 
            error: 'Check-in date must be before check-out date', 
            isLoggedIn: req.session.isLoggedIn,
            userType: req.session.userType
        });
    }

    // Calculate number of days and total price
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay));
    
    // First check if there are any overlapping bookings for this home
    Booking.find({
        homeId: homeId,
        status: 'confirmed',
        $or: [
            // Check in date falls within another booking
            {
                checkInDate: { $lte: checkInDate },
                checkOutDate: { $gte: checkInDate }
            },
            // Check out date falls within another booking
            {
                checkInDate: { $lte: checkOutDate },
                checkOutDate: { $gte: checkOutDate }
            },
            // Booking completely contains another booking
            {
                checkInDate: { $gte: checkInDate },
                checkOutDate: { $lte: checkOutDate }
            }
        ]
    })
    .then(conflictingBookings => {
        if (conflictingBookings.length > 0) {
            return res.status(400).render('error', {
                pageTitle: 'Booking Conflict',
                error: 'This property is already booked for some or all of the selected dates',
                isLoggedIn: req.session.isLoggedIn,
                userType: req.session.userType
            });
        }
        
        return Home.findById(homeId)
            .then(home => {
                if (!home) {
                    throw new Error('Home not found');
                }
                
                // Calculate total price based on days and price per night
                const totalPrice = diffDays * home.ppn;
                
                // Create new booking
                const booking = new Booking({
                    homeId: homeId,
                    userId: userId,
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    totalPrice: totalPrice,
                    status: 'confirmed'
                });
                
                // Save booking and update home status
                return booking.save()
                    .then(result => {
                        // Mark the home as booked
                        home.booked = true;
                        return home.save();
                    })
                    .then(() => {
                        res.redirect('/store/bookings');
                    });
            })
            .catch(err => {
                console.error('Database error:', err);
                let errorMessage = 'Failed to create booking';
                if (err.message === 'Home not found') {
                    errorMessage = 'Home not found';
                } else if (err.message === 'Home is already booked') {
                    errorMessage = 'This property is already booked';
                }
                
                res.status(500).render('error', {
                    pageTitle: 'Booking Error',
                    error: errorMessage,
                    isLoggedIn: req.session.isLoggedIn,
                    userType: req.session.userType
                });
            });
    })
    .catch(err => {
        console.error('Database error:', err);
        res.status(500).render('error', {
            pageTitle: 'Error',
            error: 'Failed to check booking availability',
            isLoggedIn: req.session.isLoggedIn,
            userType: req.session.userType
        });
    });
};

exports.postCancelBooking = (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const bookingId = req.body.bookingId;
    const userId = req.session.user.userId;

    Booking.findOne({ _id: bookingId, userId: userId })
        .then(booking => {
            if (!booking) {
                throw new Error('Booking not found');
            }
            
            if (booking.status === 'cancelled') {
                return res.status(400).render('error', {
                    pageTitle: 'Already Cancelled',
                    error: 'This booking is already cancelled',
                    isLoggedIn: req.session.isLoggedIn,
                    userType: req.session.userType
                });
            }
            
            // Change booking status to cancelled
            booking.status = 'cancelled';
            
            return booking.save()
                .then(() => {
                    // Update the home to be available again
                    return Home.findById(booking.homeId);
                })
                .then(home => {
                    if (home) {
                        home.booked = false;
                        return home.save();
                    }
                    return null;
                })
                .then(() => {
                    res.redirect('/store/bookings');
                });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('error', {
                pageTitle: 'Error',
                error: 'Failed to cancel booking',
                isLoggedIn: req.session.isLoggedIn,
                userType: req.session.userType
            });
        });
};