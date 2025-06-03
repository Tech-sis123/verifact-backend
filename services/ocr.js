const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');
const logger = require('../config/logger');


const AZURE_KEY = process.env.AZURE_COMPUTER_VISION_KEY;
const AZURE_ENDPOINT = process.env.AZURE_COMPUTER_VISION_ENDPOINT;


const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': AZURE_KEY } }),
  AZURE_ENDPOINT
);

const extractText = async (imageBuffer) => {
  try {

    const result = await computerVisionClient.readInStream(imageBuffer);


    const operationLocation = result.operationLocation;
    const operationId = operationLocation.substring(operationLocation.lastIndexOf('/') + 1);


    let readResult;
    while (true) {
      readResult = await computerVisionClient.getReadResult(operationId);
      if (readResult.status === 'succeeded' || readResult.status === 'failed') break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (readResult.status === 'failed') {
      throw new Error("OCR operation failed");
    }


    const lines = readResult.analyzeResult.readResults.flatMap(page =>
      page.lines.map(line => line.text)
    );
    return lines.join('\n');

  } catch (error) {
    logger.error(`OCR failed: ${error}`);
    throw new Error("Could not extract text from image");
  }
};

module.exports = { extractText };












