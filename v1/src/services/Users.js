const Users = require('../models/Users');
const User = require('../models/Users');

const insert = (data) => {

    const user = new User(
        data
    );

    return user.save();
};

const loginUser = (loginData) => {

    return User.findOne(loginData);
};

const list = () => {
    return User.find({});
};

const modify = (where, updateData) => {
    return User.findOneAndUpdate(where, updateData, { new: true });
};

const remove = (id) => {
    return User.findByIdAndDelete(id);
};


module.exports = {
    insert,
    list,
    loginUser,
    modify,
    remove,
}