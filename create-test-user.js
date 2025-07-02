// Script to create a test user in the database
const mongoose = require('mongoose');
const User = require('./models/user');

const dbpath = "mongodb+srv://satyam:root@cluster0.xxktm1z.mongodb.net/airbnb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbpath).then(() => {
    console.log("Connected to MongoDB!");
    
    // Check if test user already exists
    User.findOne({ email: 'test@example.com' })
        .then(existingUser => {
            if (existingUser) {
                console.log('Test user already exists');
                return existingUser;
            } else {
                // Create a new test user
                const user = new User({
                    email: 'test@example.com',
                    password: 'password', // In a real app, this would be hashed
                    userType: 'Business', // Set as Business user
                    favorites: [],
                    listings: []
                });
                
                return user.save();
            }
        })
        .then(user => {
            console.log('Test user available:', user);
            process.exit(0);
        })
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
});
