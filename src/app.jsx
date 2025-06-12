import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [question, setQuestion] = useState('');
  const [sliders, setSliders] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setSliders([]);
    setPrompt('');
    setGeneratedOutput('');

    try {
      const response = await axios.post('http://localhost:3000/api/nlp-parser', { question });
      const parsedSliders = response.data.sliders;

      if (!Array.isArray(parsedSliders) || parsedSliders.length === 0) {
        setError('No sliders generated. Try a different question.');
        return;
      }

      const slidersWithValues = parsedSliders.map(s => ({ ...s, value: s.default || 50 }));
      setSliders(slidersWithValues);
    } catch (err) {
      console.error("API ERROR:", err);
      setError('Failed to generate sliders.');
    }
  };

  const handleSliderChange = (index, value) => {
    const updated = [...sliders];
    updated[index].value = value;
    setSliders(updated);
  };

  const assemblePrompt = () => {
    const mods = sliders.map(s => `${s.label}: ${s.value}`).join(', ');
    const finalPrompt = `${question} (${mods})`;
    setPrompt(finalPrompt);
  };

  const handleGenerateOutput = async () => {
    if (!prompt) {
      setError('Please assemble the prompt first.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedOutput('');

    try {
      const response = await axios.post('http://localhost:3000/api/generate-final', { prompt });
      const rawOutput = response.data.output;

      const formattedOutput = rawOutput
        .split(/[\r\n]+/)
        .filter(line => line.trim() !== '')
        .map(line => `• ${line}`)
        .join('\n');

      setGeneratedOutput(formattedOutput);
    } catch (err) {
      console.error("FINAL GPT ERROR:", err);
      setError('Failed to generate final output.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      {/* LOGO + Tagline Section — changed to trigger redeploy 🚀 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <picture>
          <source srcSet="/logo-light.png" media="(prefers-color-scheme: dark)" />
          <img
            src="/logo-dark.png"
            alt="The Youth Venture Icon"
            style={{ height: '64px', marginBottom: '12px', borderRadius: '8px' }}
          />
        </picture>

        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>The Youth Venture</h1>
        <p style={{ fontSize: '1rem', color: '#444', marginTop: '8px' }}>
          Bringing AI to Life — Visually for Everyone ✨
        </p>
      </div>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question..."
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid #ccc'
        }}
      />
      <button
        onClick={handleGenerate}
        style={{
          marginTop: '12px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#111',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Generate Sliders
      </button>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      {sliders.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          {sliders.map((s, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>{s.label}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={s.value}
                onChange={(e) => handleSliderChange(i, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          ))}

          <button
            onClick={assemblePrompt}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#555',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Assemble Prompt
          </button>

          {prompt && (
            <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
              <b>Final Prompt:</b>
              <p>{prompt}</p>

              <button
                onClick={handleGenerateOutput}
                disabled={loading}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Generating...' : 'Generate Output'}
              </button>
            </div>
          )}
        </div>
      )}

      {generatedOutput && (
        <div style={{
          marginTop: '40px',
          background: '#e3e3e3',
          padding: '20px',
          borderRadius: '8px',
          whiteSpace: 'pre-line'
        }}>
          <h3>Generated Output <span role="img" aria-label="result">✨</span></h3>
          <p>{generatedOutput}</p>
          <div style={{ fontSize: '24px', marginTop: '10px' }}>
            <span role="img" aria-label="clap">👏</span>{' '}
            <span role="img" aria-label="thumbs up">👍</span>{' '}
            <span role="img" aria-label="rocket">🚀</span>
          </div>
        </div>
      )}
    </div>
  );
}
