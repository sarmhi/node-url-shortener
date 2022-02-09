const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    urls: [
        {
        type: mongoose.ObjectId,
        required: true,
        ref: 'Url'
    }]
}, { timestamps: true })

module.exports = new mongoose.model('User', userSchema)