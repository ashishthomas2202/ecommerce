const mongoose = require('mongoose');
const crypto = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    hashed_password: {
        type: String,
        required: true,
    },
    // profile: {
    //     type: String,
    //     trim: true,
    //     required: true,
    //     maxlength: 32,
    // },
    salt: String,
    role: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

userSchema.virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = uuidv4();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

userSchema.virtual('fullname')
    .get(function() {
        return firstName + " " + lastName;
    });

userSchema.methods = {
    encryptPassword: function(password) {

        if (!password)
            return '';

        try {
            return crypto.HmacSHA256(password, this.salt);
        } catch (err) {
            return { err };
        }
    }
}

module.exports = mongoose.model('User', userSchema);