const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
    houseName: {
        type: String,
        required: true
    },
    Location: {
        type: String,
        required: true
    },
    ppn: {
        type: Number,
        required: true
    },
    photoUrl: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booked: {
        type:Boolean,
        required: true
    }
}) // A model is a JavaScript representation of a collection in MongoDB.

module.exports = mongoose.model('Home', homeSchema);