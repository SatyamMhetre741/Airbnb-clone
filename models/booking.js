const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    homeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Home'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
