const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HDDViewsSchema = new Schema({
    profile: { type: String, default: 'custom' },
    plantName: { type: String, required: true },
    terminalName: { type: String, required: true },
    measurandNames: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    collection: 'HDDViews',
    timestamps: true
});

const HDDViews = mongoose.models.HDDViews || 
    mongoose.model('HDDViews', HDDViewsSchema);

module.exports = HDDViews;