const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)

const verificationSchema = new mongoose.Schema({
  inputText: { type: String, required: true },
  inputType: { type: String, enum: ['text', 'image', 'text+image'], required: true },
  verdict: { type: String, enum: ['True', 'False', 'Inconclusive'], required: true },
  summary: { type: String, required: true },
  lastVerified: { type: String, required: true },

  detailedAnalysis: {
    type: String,
    required: true,
    default: 'not yet analyzed'
  },

  sourcesUsed: [
    {
      url: String,
      relevance: String,
      publicationDate: { type: String, default: 'unknown' }
    }
  ],

  nextSteps: { type: String },
  language: {type: String, required: true},

  metadata: {
    processedAt: { type: Date, default: Date.now },
    sourceCount: Number,
    modelUsed: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
