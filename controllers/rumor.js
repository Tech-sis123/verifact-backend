const Verification = require('../models/verification');
const ocrService = require('../services/ocr');
const searchService = require('../services/search');
const aiService = require('../services/ai');
const logger = require('../config/logger');

const verifyRumor = async (req, res) => {
  try {
    let inputText = req.body.text?.trim() || '';
    let inputType = 'text';


    if (req.file && req.file.buffer) {
      const imageText = await ocrService.extractText(req.file.buffer);
      if (imageText?.trim()) {
        inputType = inputText ? 'text+image' : 'image';
        inputText = `${inputText}\n\n[Extracted from image]: ${imageText.trim()}`;
      }
    }

    const searchResults = await searchService.query(inputText);
    const analysis = await aiService.analyze(inputText, searchResults);

    const verification = new Verification({
      inputText,
      inputType,
      verdict: analysis.verdict,
      summary: analysis.summary,
      lastVerified: analysis.lastVerified,
      detailedAnalysis: analysis.detailedAnalysis,
      sourcesUsed: analysis.sourcesUsed,
      nextSteps: analysis.nextSteps,
      language: analysis.language,
      metadata: analysis.metadata
    });

    const savedDoc = await verification.save();
    logger.info(`Verification saved to DB: ${savedDoc._id}`);

    res.json({
      id: savedDoc._id,
      verdict: savedDoc.verdict,
      summary: savedDoc.summary,
      lastVerified: savedDoc.lastVerified,
      detailedAnalysis: savedDoc.detailedAnalysis,
      nextSteps: savedDoc.nextSteps,
      sourcesUsed: savedDoc.sourcesUsed,
      language: savedDoc.language
    });

  } catch (error) {
    logger.error(`Verification failed: ${error.message || error}`);
    res.status(500).json({ error: 'Verification failed!' });
  }
};

const getPastVerifications = async (req, res) => {
  try {
    const verification = await Verification.find().sort({ createdAt: -1 });
    res.json(verification);
  } catch (error) {
    logger.error(`Database query failed: ${error}`);
    res.status(500).json({ error: 'Failed to get past verification!' });
  }
};

module.exports = { verifyRumor, getPastVerifications };
