const Sections = require('../models/Sections');

const insert = (data) => {

    const section = new Sections(
        data
    );

    return section.save();
};

const list = (where) => {
    return Sections.find(where || {}).populate({
        path: 'user_id',
        select: 'full_name email profile_image',

    });
    // .populate({
    //     path: 'project_id',
    //     select: 'name',

    // });
};

const modify = (data, id) => {
    return Sections.findByIdAndUpdate(id, data, { new: true });
};

const remove = (id) => {
    return Sections.findByIdAndDelete(id);
};

module.exports = {
    insert,
    list,
    modify,
    remove,
}