const OpenAI = require("openai");
const logger = require("../config/logger.js");

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY
});

const analyze = async (text, searchResults = []) => {
  if (!text || typeof text !== 'string') {
    throw new Error("Invalid input: non-empty 'text' is required");
  }

  const formattedSources = Array.isArray(searchResults)
    ? searchResults.map(result => ({
      title: result?.title || "Untitled source",
      link: result?.link || "#",
      snippet: result?.snippet || ""
    }))
    : [];


  const prompt = `
You are a senior fact-checking analyst verifying: "${text}"

Your analysis must adhere to the following and you must return a response in the language of the text you're analyzing:

**1. Verdict:**
    - "True": If 1 or more authoritative sources corroborate the claim and also if the 1 or 2 sources supporting the claim are very very credible and known for purely true and backed up information
    - "False": If 2 or more reliable debunkings contradict the claim.
    - "Inconclusive": If evidence is conflicting or insufficient.

**2. Detailed Analysis:**
    - **Summary (10-30 words):** Provide a concise overview of your findings.
    - **Narrative Explanation:** Write a detailed, coherent explanation (in sentence format) that debunks or supports the claim. This explanation *must* integrate direct quotes and reference specific sources to back up each point.
        - **For "True" verdicts:** Clearly explain how the sources corroborate the claim, citing specific details and timestamps where available.
        - **For "False" verdicts:** Explain the rumor's origin and precisely how the debunking sources contradict it, highlighting discrepancies and factual inaccuracies.
        - **For "Inconclusive" verdicts:** Clearly state what information is missing, why the available evidence is insufficient or conflicting, and what would be needed to reach a definitive verdict.
    - **Key Findings:** Within the narrative, identify and present 3-5 distinct key findings. Each key finding must be a clear statement, followed by its direct quote from a source, and explicit mention of the supporting source(s) (e.g., "According to [Source Name/URL], 'direct quote here'").

**3. Last Verification Date:** Include the date of this verification.

**Sources Available:**
${JSON.stringify(formattedSources.slice(0, 10))} ${formattedSources.length > 10 ? `(+ ${formattedSources.length - 10} more)` : ''}

**Output Schema (JSON):**
{
  "verdict": "True|False|Inconclusive",
  "summary": "string",
  "lastVerified": "YYYY-MM-DD",
  "detailedAnalysis": "string", 
  "sourcesUsed": [
    {
      "url": "string",
      "relevance": "string",
      "publicationDate": "string|unknown"
    }
  ]
    "next steps": "string"
}`;

  try {
    const response = await retry(
      async () => {
        const result = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" }
        });
        return result;
      },
      {
        retries: 2,
        minTimeout: 1000
      }
    );

    if (
      !response ||
      !response.choices ||
      !response.choices[0]?.message?.content
    ) {
      throw new Error("OpenAI response missing or malformed");
    }

    const analysis = JSON.parse(response.choices[0].message.content);

    if (!['True', 'False', 'Inconclusive'].includes(analysis.verdict)) {
      throw new Error("Invalid verdict from AI");
    }

    return {
      ...analysis,
      metadata: {
        processedAt: new Date().toISOString(),
        sourceCount: analysis.sourcesUsed?.length || 0,
        modelUsed: "gpt-4-turbo"
      }
    };

  } catch (error) {
    logger.error(`AI analysis failed: ${error.stack}`);
    throw new Error(`Analysis failed: ${error.message}`);
  }
};


async function retry(fn, options = {}) {
  const { retries = 3, minTimeout = 1000 } = options;
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise(res => setTimeout(res, minTimeout));
    }
  }

  throw lastError;
}

module.exports = { analyze };
