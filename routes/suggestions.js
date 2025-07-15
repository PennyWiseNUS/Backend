const axios = require('axios');
const express = require('express');
const router = express.Router();
require('dotenv').config();

router.post('/', async (req, res) => {
    const {goal, entriesResult} = req.body;
    // prompt
    const prompt = `
    You are a financial advisor. I have a goal:
    - Goal Name: ${goal.goalName}
    - Goal Target: $${goal.goalAmount}
    - Current Amount: $${goal.currentAmount}
    - Target completion: ${new Date(goal.goalDeadline).toLocaleDateString()}
    
    I have provided the recent 20 transactions for you to develop your recommendations on.
    ${entriesResult.map(entry => `- ${entry.entryDate}: ${entry.type} ${entry.category} $${entry.amount}`).join('\n')}
    
    Suggest 2 personalised ways they can achieve their goal by the target completion date. Keep each suggestion to less than 50 words.

    The format should be as follows:
    Suggestion 1: \n
    (suggestion) \n
    Suggestion 2: \n
    (suggestion)

    Please provide only 2 suggestions, not more and they should be in plain text format and not markdown format.
    `.trim();

    try {
        const aiResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: [{ role: "user", content: prompt}],
                temperature: 0.7 // controls creativity 0 - strict + factual, 1 very creative
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                    'content-Type': 'application/json',
                },
            }
        );
        const suggestion = aiResponse.data.choices[0].message.content;
        res.json({suggestion});
    } catch (err) {
        console.error("OpenRouter API error:", err.response?.data || err.message);
        res.status(500).json({ error: "Suggestions generation failed" });
    }
});

module.exports = router;