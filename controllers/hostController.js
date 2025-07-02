const Home = require('../models/homes');

exports.getAddHomes = (req, res) => {
    res.render("host/add-home", { pageTitle: "Add Home" , isLoggedIn: req.session.isLoggedIn});
}

exports.getEditHomes = (req, res) => {
    const homeId = req.params.homeID;
    const userId = req.session.user.userId;
    const editing = req.query.editing === 'true';

    Home.findById(homeId)
        .then(home => {
            if (!home) {
                return res.status(404).render('404', { pageTitle: 'Home Not Found', isLoggedIn: req.session.isLoggedIn });
            }
            
            // Check if this home belongs to the current user
            if (home.owner && home.owner.toString() !== userId) {
                return res.status(403).render('403', { 
                    pageTitle: 'Access Denied', 
                    error: 'You do not have permission to edit this home',
                    isLoggedIn: req.session.isLoggedIn 
                });
            }
            
            // Convert MongoDB ObjectId to string for the template
            // When passing data to EJS templates (or sending as JSON), it's often easier and safer to work with string IDs, especially for:
            // Displaying in HTML
            // Using as values in forms or URLs
            // Avoiding serialization issues (since ObjectId is not a string by default)
            const homeObj = home.toObject(); // Convert Mongoose document to plain object
            homeObj._id = homeObj._id.toString(); // Convert ObjectId to string
            
            // Ensure photoUrl is valid
            if (!homeObj.photoUrl || homeObj.photoUrl.trim() === '') {
                homeObj.photoUrl = '/images/placeholder-house.jpg';
            }
            
            console.log("Home found with ID:", homeObj._id);
            
            res.render("host/edit-home", { 
                pageTitle: "Edit Home", 
                home: homeObj, 
                editing: editing, 
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to fetch home for editing' 
            });
        });
}

exports.postAddHomes = (req, res) => {
    // Destructuring the form data
    const { houseName, Location, ppn } = req.body;
    console.log("Form data:", { houseName, Location, ppn });
    console.log("File data:", req.file); // Log the file data for debugging
    
    // Get the file path for storage in the database
    // The path should be relative to the public directory since that's what's served to the browser
    let photoUrl = '/images/placeholder-house.jpg'; // Default placeholder
    
    if (req.file) {
        // Convert Windows backslashes to forward slashes for web paths
        photoUrl = req.file.path.replace('public', '').replace(/\\/g, '/');
        console.log("Photo URL:", photoUrl);
    } else {
        console.log("No file uploaded, using default placeholder");
    }
    
    console.log("Creating home with data:", {
        houseName,
        Location,
        ppn,
        photoUrl,
        owner: req.session.user.userId,
        booked: false
    });
    
    // Create a new home instance
    const home = new Home({
        houseName: houseName,
        Location: Location,
        ppn: parseFloat(ppn), // Convert to number
        photoUrl: photoUrl,
        owner: req.session.user.userId, // Associate with current user
        booked: false // Set initial booking status to false (available)
    });

    home.save()
        .then(result => {
            console.log("Home saved successfully:", result);
            res.render("host/home-added", { 
                pageTitle: "Home Added",
                home: home, 
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            console.error('Validation errors:', err.errors);
            
            // Show more specific error message if available
            let errorMessage = "Error saving home. Please try again.";
            if (err.name === 'ValidationError') {
                const validationErrors = Object.values(err.errors).map(e => e.message);
                errorMessage = `Validation error: ${validationErrors.join(', ')}`;
            }
            
            res.status(500).render("host/add-home", { 
                pageTitle: "Add Home", 
                error: errorMessage,
                formData: req.body, // Pass back form data to pre-fill the form
                isLoggedIn: req.session.isLoggedIn
            });
        });
}

exports.getHostHomes = (req, res, next) => { 
    // Only find homes owned by the current user
    Home.find({ owner: req.session.user.userId })
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
            
            res.render("host/admin-home-list", { 
                homes: homesWithStringIds, 
                pageTitle: "Your Properties", 
                isLoggedIn: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render('500', { 
                pageTitle: 'Error', 
                error: 'Failed to fetch your properties' , isLoggedIn: req.session.isLoggedIn
            });
        });
};

exports.postEditHome = (req, res) => {
    const homeId = req.params.homeID;
    const userId = req.session.user.userId;
    
    const { houseName, Location, ppn, currentPhotoUrl } = req.body;

    // First check if this home belongs to the current user
    Home.findById(homeId)
        .then(home => {
            if (!home) {
                return res.status(404).render('404', { 
                    pageTitle: 'Home Not Found', 
                    isLoggedIn: req.session.isLoggedIn 
                });
            }
            
            if (home.owner.toString() !== userId) {
                return res.status(403).render('403', { 
                    pageTitle: 'Access Denied', 
                    error: 'You do not have permission to edit this home',
                    isLoggedIn: req.session.isLoggedIn 
                });
            }
            
            // Determine which photo URL to use
            let photoUrl = currentPhotoUrl; // Default to current photo
            
            if (req.file) {
                // If a new file was uploaded, use its path
                photoUrl = req.file.path.replace('public', '').replace(/\\/g, '/');
                console.log("New photo URL:", photoUrl);
            }
            
            // If authorized, update the home
            const updatedHome = {
                houseName,
                Location,
                ppn,
                photoUrl,
                // Maintain the current booking status
                booked: home.booked
            };
            
            return Home.findByIdAndUpdate(homeId, updatedHome)
                .then(() => {
                    // Redirect to the host homes list on success
                    res.redirect('/host/host-home-list');
                });
        })
        .catch(err => {
            console.error('Database error:', err);
            // If update fails, show the edit form again with an error
            res.status(500).render("host/edit-home", { 
                pageTitle: "Edit Home", 
                error: "Error updating home. Please try again.",
                home: { ...req.body, _id: homeId },
                editing: true, 
                isLoggedIn: req.session.isLoggedIn
            });
        });
};

exports.postDeleteHome = (req, res) => {
    const homeId = req.params.homeID;
    const userId = req.session.user.userId;
    
    // First check if this home belongs to the current user
    Home.findById(homeId)
        .then(home => {
            if (!home) {
                return res.status(404).render('404', { 
                    pageTitle: 'Home Not Found', 
                    isLoggedIn: req.session.isLoggedIn 
                });
            }
            
            if (home.owner.toString() !== userId) {
                return res.status(403).render('403', { 
                    pageTitle: 'Access Denied', 
                    error: 'You do not have permission to delete this home',
                    isLoggedIn: req.session.isLoggedIn 
                });
            }
            
            // If authorized, delete the home
            return Home.findByIdAndDelete(homeId)
                .then(() => {
                    res.redirect('/host/host-home-list');
                });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).render("host/admin-home-list", { 
                pageTitle: "Your Properties", 
                error: "Error deleting home. Please try again.", 
                isLoggedIn: req.session.isLoggedIn
            });
        });
};