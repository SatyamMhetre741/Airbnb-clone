// now the router does just the routing work, and the logic part goes to the controller

const express = require('express');
const multer = require('multer');
const path = require('path');
const fileUtils = require('../util/fileUtils');
const hostRouter = express.Router();
const hostController = require('../controllers/hostController');

// Ensure upload directory exists
const uploadDir = fileUtils.ensureUploadDirectoryExists();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads/');
    },
    filename: (req, file, cb) => {
        // Sanitize filename and add timestamp to prevent overwriting
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, Date.now() + '-' + sanitizedName);
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

hostRouter.get("/add-home", hostController.getAddHomes);
hostRouter.post("/add-home", upload.single('photo'), hostController.postAddHomes);
hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/edit-home/:homeID", hostController.getEditHomes);
hostRouter.post("/edit-home/:homeID", upload.single('photo'), hostController.postEditHome);
hostRouter.post("/delete-home/:homeID", hostController.postDeleteHome);

// Add error handling middleware for multer errors
hostRouter.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).render('host/add-home', {
                pageTitle: 'Add Home',
                error: 'File is too large. Maximum size is 5MB.',
                formData: req.body,
                isLoggedIn: req.session.isLoggedIn
            });
        }
        return res.status(400).render('host/add-home', {
            pageTitle: 'Add Home',
            error: `File upload error: ${err.message}`,
            formData: req.body,
            isLoggedIn: req.session.isLoggedIn
        });
    } else if (err) {
        console.error('Other error:', err);
        // An unknown error occurred
        return res.status(500).render('500', {
            pageTitle: 'Error',
            error: err.message,
            isLoggedIn: req.session.isLoggedIn
        });
    }
    next();
});

exports.hostRouter = hostRouter;
