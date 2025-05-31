const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const verificationSchema = new mongoose.Schema({
    inputText: {type: String, required: true},
    inputType:{type: String, enum: ['text', 'image'], required: true},
    verdict: {type: String, enum:['True', 'False', 'Inconclusive'], required: true},
    explanation:{type: String, required: true},
    sources: {type: [String], default: []},
    createdAt: {type: Date, default: Date.now},
});
module.exports = mongoose.model('Verification', verificationSchema);