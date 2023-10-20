const Mongoose = require('mongoose');

const UsersSchema = new Mongoose.Schema({
    full_name: String,
    password: String,
    email: { type: String, unique: true },
    profile_image: String,
}, { timestamps: true, versionKey: false }
);

module.exports = Mongoose.model('user', UsersSchema);