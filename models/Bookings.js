const mongoose=  require('mongoose');

const BookingSchema = mongoose.Schema({
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
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
