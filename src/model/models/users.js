const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const Address = new Schema({
    street: { 
        type: String, 
        required: true 
    },
    number: {         
        type: Number,
        min: 1,
        required: true
        },
    city: { 
            type: String,
            required: true 
        },
    province: { 
            type: String,
            required: true
    }
}, { _id: false });

const userSchema = new Schema({
    username:  {
        type: String,
        required: true,
        unique: true
    },
    name:  {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        min: 1111111111,
        max: 9999999999
    },
    password: {
        type: String,
        required: true,
    },
    admin: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    addresses: [
        {
            type: Address
        },
    ]
});

function createUsersModel() {
    const User = mongoose.model('User', userSchema);
    return User;
}

function getIdFromToken(tokenHeader) {
    const bearer = tokenHeader;
    const token = (bearer !== undefined ? bearer : '').replace('Bearer ', '');
    const { _id } = jwt.decode(token);

    return _id;
}

module.exports = {
    createUsersModel,
    getIdFromToken,
}