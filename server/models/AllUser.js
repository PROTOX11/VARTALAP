const mongoose = require('mongoose');


const allUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'User'
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/dyjlmweqb/image/upload/v1752616422/icon-7797704_640_an798v.png'
    },
    about: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    coverPhoto: {
        type: String,
        default: ''
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('AllUser', allUserSchema);
