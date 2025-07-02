// Script to update existing homes with an owner field
const mongoose = require('mongoose');
const Home = require('./models/homes');
const User = require('./models/user');

const dbpath = "mongodb+srv://satyam:root@cluster0.xxktm1z.mongodb.net/airbnb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbpath).then(async () => {
    console.log("Connected to MongoDB!");
    
    try {
        // Get the first business user to assign as default owner
        const businessUser = await User.findOne({ userType: 'Business' });
        
        if (!businessUser) {
            console.log('No business user found. Please run create-test-user.js first.');
            process.exit(1);
        }
        
        // Find all homes without an owner
        const homes = await Home.find({ owner: { $exists: false } });
        
        if (homes.length === 0) {
            console.log('No homes without owner field found.');
            process.exit(0);
        }
        
        console.log(`Found ${homes.length} homes without owner. Updating...`);
        
        // Update each home
        for (const home of homes) {
            home.owner = businessUser._id;
            await home.save();
        }
        
        console.log(`Updated ${homes.length} homes with owner: ${businessUser.email}`);
        process.exit(0);
    } catch (err) {
        console.error('Error updating homes:', err);
        process.exit(1);
    }
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
});
