const Mongoose = require('mongoose');
const logger = require('../scripts/logger/Sections');

const SectionsSchema = new Mongoose.Schema({
    name: String,
    user_id: {
        type: Mongoose.Types.ObjectId,
        ref: 'user'
    },
    project_id: {
        type: Mongoose.Types.ObjectId,
        ref: 'project',
    },
    order: Number,
},
    { timestamps: true, versionKey: false }
);



SectionsSchema.post('save', (doc) => {
    logger.log({
        level: 'info',
        message: `Section ${doc} created`,
    });
    // kayıt edilmiştir... loglama ....
});

module.exports = Mongoose.model('section', SectionsSchema);