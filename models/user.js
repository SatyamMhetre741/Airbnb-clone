const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['Individual', 'Business'],
        default: 'Individual',
        required: true
    },
    favorites: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Home'
        }
    ],
    listings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Home'
        }
    ], 
    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Home'
        }
    ]
});

userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email });
};

userSchema.methods.checkPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
