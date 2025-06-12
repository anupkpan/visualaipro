import axios from 'axios';

export default async function handler(req, res) {
  const { question } = req.body;

  console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const openai_api_key = process.env.OPENAI_API_KEY;
  if (!openai_api_key) {
    return res.status(500).json({ error: 'Missing OpenAI API Key in server environment' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI parameter extractor.
Only output a valid JSON array of sliders, nothing else.
Each slider must have:
- label (string)
- min (0)
- max (100)
- default (0-100)
If unsure, always return at least 3 sliders.

Example:
[
  {"label":"Tone","min":0,"max":100,"default":50},
  {"label":"Length","min":0,"max":100,"default":50},
  {"label":"Formality","min":0,"max":100,"default":50}
]`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.4
      },
      {
        headers: {
          'Authorization': `Bearer ${openai_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let text = response.data.choices[0].message.content;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const arrayMatch = text.match(/\[[\s\S]*\]/);
    let parsedSliders;

    if (arrayMatch) {
      try {
        parsedSliders = JSON.parse(arrayMatch[0]);
      } catch (parseErr) {
        console.error("JSON parse failed after regex match:", parseErr);
      }
    }

    if (!Array.isArray(parsedSliders) || parsedSliders.length === 0) {
      console.warn("GPT failed to return valid sliders. Using fallback defaults.");
      parsedSliders = [
        { label: "Tone", min: 0, max: 100, default: 50 },
        { label: "Length", min: 0, max: 100, default: 50 },
        { label: "Formality", min: 0, max: 100, default: 50 }
      ];
    }

    res.status(200).json({ sliders: parsedSliders });
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: 'Failed to generate sliders', detail: err.message });
  }
}
