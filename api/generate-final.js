const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const openai_api_key = process.env.OPENAI_API_KEY;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',  // or gpt-3.5-turbo if needed
        messages: [
          {
            role: 'system',
            content: `You are an expert AI assistant. Generate a full response based on the given engineered prompt. Only give clean, natural text output. Do not add markdown or code blocks.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${openai_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let output = response.data.choices[0].message.content;

    // 🧹 Clean GPT output (remove markdown if it disobeys instructions)
    output = output.replace(/```(json|text)?/g, '').replace(/```/g, '').trim();

    res.status(200).json({ output });
  } catch (err) {
    console.error("FINAL GPT ERROR:", err);
    res.status(500).json({ error: 'Failed to generate final output', detail: err.message });
  }
};
