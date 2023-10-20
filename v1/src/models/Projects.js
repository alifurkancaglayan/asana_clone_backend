const Mongoose = require('mongoose');
const logger = require('../scripts/logger/Projects');

const ProjectsSchema = new Mongoose.Schema({
    name: String,
    user_id: {
        type: Mongoose.Types.ObjectId,
        ref: 'user'
    },

},
    { timestamps: true, versionKey: false }
);

// ProjectsSchema.pre('save', (next, doc) => {
//     console.log('Oncesi', doc);
//     next();
// });

ProjectsSchema.post('save', (doc) => {
    logger.log({
        level: 'info',
        message: `Project ${doc} created`,
    });
    // kayıt edilmiştir... loglama ....
});

module.exports = Mongoose.model('project', ProjectsSchema);