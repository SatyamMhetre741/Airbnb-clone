const mongoose=  require('mongoose');

const favouriteSchema = mongoose.Schema({
    homeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Home' 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    }
});

module.exports = mongoose.model('Favourite', favouriteSchema);
