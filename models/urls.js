const mongoose = require("mongoose");
const { Schema } = mongoose;

const urlSchema = new Schema({
    long_url: {
        type: String,
        required: true
    },
    short_url: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.ObjectId,
        required: false,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = new mongoose.model('Url', urlSchema)