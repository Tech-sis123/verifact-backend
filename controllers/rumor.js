const Verification = require('../models/verification');
const ocrService = require('../services/ocr');
const searchService = require('../services/search');
const aiService = require('../services/ai');
const logger = require('../config/logger');

const verifyRumor = async (req, res) => {
    try {
        let inputText = req.body.text;
        let inputType = 'text';

        // Extract text from image if available
        if (req.file && req.file.buffer) {
            inputText = await ocrService.extractText(req.file.buffer);
            inputType = 'image';
        }

        // Search and analyze text
        const searchResults = await searchService.query(inputText);
        const { verdict, explanation, sources } = await aiService.analyze(inputText, searchResults);

        // Save to database
        const verification = new Verification({
            inputText,
            inputType,
            verdict,
            explanation,
            sources
        });

        const savedDoc = await verification.save();

        logger.info(`Verification saved to DB: ${savedDoc._id}`);

        // Return saved info with MongoDB ID
        res.json({
            id: savedDoc._id,
            verdict,
            explanation,
            sources
        });

    } catch (error) {
        logger.error(`Verification failed: ${error.message || error}`);
        res.status(500).json({ error: 'Verification failed!' });
    }
};


const getPastVerifications = async (req, res) => {
    try {
        const verification =await Verification.find().sort({
            createdAt: -1})
            res.json(verification)
    } catch (error) {
        logger.error(`Database query failed: ${error}`)
        res.status(500).json({ error: 'Failed to get past verification!' })
    }
}
module.exports ={verifyRumor, getPastVerifications};