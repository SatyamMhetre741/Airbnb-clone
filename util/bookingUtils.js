// Utility function to check and update booking status and home availability
// This should be called periodically or before displaying homes

const Home = require('../models/homes');
const Booking = require('../models/booking');

// This function checks all confirmed bookings and updates home availability
// if the booking end date has passed
exports.updateBookingStatus = async () => {
    try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time portion for fair comparison
        
        // Find all confirmed bookings with checkout dates that have passed
        const expiredBookings = await Booking.find({
            status: 'confirmed',
            checkOutDate: { $lt: currentDate }
        });
        
        // For each expired booking, update the home's booked status
        for (const booking of expiredBookings) {
            const home = await Home.findById(booking.homeId);
            
            if (home) {
                // Check if there are any active bookings for this home
                const activeBookings = await Booking.find({
                    homeId: booking.homeId,
                    status: 'confirmed',
                    checkOutDate: { $gte: currentDate }
                });
                
                // If no active bookings, mark the home as available
                if (activeBookings.length === 0) {
                    home.booked = false;
                    await home.save();
                }
            }
            
            // Mark the expired booking as completed
            booking.status = 'completed';
            await booking.save();
        }
        
        return { updated: expiredBookings.length };
    } catch (error) {
        console.error('Error updating booking status:', error);
        return { error: error.message };
    }
};
