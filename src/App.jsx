import React, { useState } from "react";
import "./index.css";

function App() {
  const [query, setQuery] = useState("");
  const [sliders, setSliders] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [finalPrompt, setFinalPrompt] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    try {
      const res = await fetch("/api/nlp-parser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!data || !data.sliders) {
        setError("Failed to generate sliders.");
        return;
      }

      setSliders(data.sliders);
      setSelectedOptions({});
      setError("");
    } catch (err) {
      console.error("API ERROR:", err);
      setError("Error calling API.");
    }
  };

  const handleSliderChange = (sliderName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [sliderName]: value,
    }));
  };

  const handleAskAI = async () => {
    try {
      const finalResponse = await fetch("/api/generate-final", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, selectedOptions }),
      });

      const finalData = await finalResponse.json();
      setFinalPrompt(finalData.finalPrompt || "No response received.");
    } catch (err) {
      console.error("API ERROR:", err);
      setFinalPrompt("Error calling final API.");
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Visual AI Pro</h1>
      <input
        className="query-input"
        type="text"
        placeholder="Type your prompt (e.g., how to cook biryani)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="generate-btn" onClick={handleGenerate}>
        Generate Sliders
      </button>

      {error && <div className="error">{error}</div>}

      {sliders.map((slider, idx) => (
        <div key={idx} className="slider-container">
          <label>{slider.name}</label>
          <input
            type="range"
            min="0"
            max={slider.options.length - 1}
            value={selectedOptions[slider.name] || 0}
            onChange={(e) =>
              handleSliderChange(slider.name, parseInt(e.target.value))
            }
          />
          <span>{slider.options[selectedOptions[slider.name] || 0]}</span>
        </div>
      ))}

      {sliders.length > 0 && (
        <button className="ask-btn" onClick={handleAskAI}>
          Ask AI
        </button>
      )}

      {finalPrompt && (
        <div className="final-output">
          <h3>AI Response:</h3>
          <p>{finalPrompt}</p>
        </div>
      )}
    </div>
  );
}

export default App;
