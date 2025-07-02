// core module
const path = require('path');
const dbpath = "mongodb+srv://satyam:root@cluster0.xxktm1z.mongodb.net/airbnb?retryWrites=true&w=majority&appName=Cluster0";
// External module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// Local module
const userRouter = require('./routes/userRouter'); 
const {hostRouter} = require('./routes/hostRouter');
const {authRouter} = require('./routes/authRouter');
const app = express();
const errorController = require('./controllers/errorController')

// Set up session store
const store = new MongoDBStore({
    uri: dbpath,
    collection: 'sessions'
});

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', 'views');

// Parse request body
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Make session data available in views
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    
    // If user is logged in and has userType info, make it available
    if (req.session.isLoggedIn && req.session.user && req.session.user.userType) {
        res.locals.userType = req.session.user.userType;
    } else {
        // Default value if not logged in or userType not available
        res.locals.userType = 'Individual';
    }
    
    next();
});

// Middleware to log request details
app.use((req, res, next) => {
    console.log(req.url, req.method);
    next();
});

// Auth routes should come first
app.use(authRouter);

// Routes that don't require authentication
app.use(userRouter);

// Protect host routes - require authentication
app.use("/host", (req, res, next) => {
    if(req.session.isLoggedIn){
        next();
    } else {
        res.redirect("/login");
    }
});

// Host routes (protected)
app.use("/host", hostRouter);

// 403 error handler
app.use(errorController.forbiddenPage);

// if no route matches, send a 404 response
app.use(errorController.errorPage);

const { default: mongoose } = require('mongoose');
mongoose.connect(dbpath).then(() => {
    console.log("Connected to MongoDB!");

    const startServer = (port) => {
        try {
            app.listen(port, () => {
                console.log(`Server running on http://localhost:${port}`);
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${port} is busy, trying port ${port + 1}`);
                    startServer(port + 1);
                } else {
                    console.error('Server error:', err);
                }
            });
        } catch (err) {
            console.error('Failed to start server:', err);
        }
    };
    
    startServer(3000);
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});