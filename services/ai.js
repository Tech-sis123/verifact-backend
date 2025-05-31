const openAI = require('openai');
const logger = require('../config/logger.js'); 
const openai = new openAI(process.env.OPEN_AI_KEY);

const analyze = async (text, searchResults) => {
    
    const formattedSources = searchResults.map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet
    }));

    const prompt = `
    You are an expert fact-checker. Your task is to analyze a given rumor and verify its accuracy using provided search results from official and reputable necessary websites .

    Rumor to analyze: "${text}"

    Here are relevant search results that may help in your analysis. Each result includes a title, a link, and a snippet:
    ${JSON.stringify(formattedSources, null, 2)}

    Based on the rumor and the provided search results, perform the following:
    1. Determine a clear verdict: "True", "False", or "Inconclusive".
       - "True": The rumor is consistently supported by credible sources.
       - "False": The rumor is consistently contradicted by credible sources.
       - "Inconclusive": There isn't enough credible information to confirm or deny the rumor, or sources are conflicting.
    2. Provide a concise, factual explanation for your verdict. Reference the provided sources where applicable to support your reasoning.
    3. List only the direct links from the provided search results that were used to support your verdict or explanation.

    Return your response as a JSON object with the following structure:
    {
        "verdict": "True" | "False" | "Inconclusive",
        "explanation": "A concise explanation of your verdict, referencing the provided sources.",
        "sources": ["link_to_source_1", "link_to_source_2", ...] // Only include links directly used
    }

    Ensure the JSON is valid and complete.
    `;

    try {
      
        const response = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" } 
        });

        
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        logger.error(`AI analysis failed: ${error.message || error}`); 
        throw new Error("AI service error: Could not analyze rumor.");
    }
};

module.exports = { analyze };