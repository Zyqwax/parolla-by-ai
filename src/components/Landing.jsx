import React, { useState } from 'react';
import { TR_ALPHABET, EN_ALPHABET } from '../services/aiService';
import { getActiveProvider, getActiveModel } from '../config/aiConfig';

const POPULAR_TOPICS = {
  tr: [
    ['Genel Kültür', 'Dünya Coğrafyası', 'Tarih & Medeniyetler', 'Sinema & Filmler'],
    ['Bilim & Teknoloji', 'Futbol & Spor']
  ],
  en: [
    ['General Knowledge', 'World Geography', 'World History', 'Cinema & Movies'],
    ['Science & Tech', 'Sports & Champions']
  ]
};

const Landing = ({ onStart }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('tr');
  const [questionCount, setQuestionCount] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  const activeProvider = getActiveProvider();
  const activeModel = getActiveModel();
  const topicsRows = POPULAR_TOPICS[language];
  const maxLetters = language === 'tr' ? TR_ALPHABET.length : EN_ALPHABET.length;

  const countOptions = [
    { value: 10, label: language === 'tr' ? '10 soru' : '10 questions' },
    { value: 15, label: language === 'tr' ? '15 soru' : '15 questions' },
    { value: 20, label: language === 'tr' ? '20 soru' : '20 questions' },
    { value: 'all', label: language === 'tr' ? `Tüm alfabe (${maxLetters})` : `Full alphabet (${maxLetters})` },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    onStart(prompt.trim(), language, questionCount);
  };

  const handleSelectTopic = (topicName) => {
    setPrompt(topicName);
  };

  return (
    <div className="landing-wrapper">
      {/* Top badges */}
      <div className="top-badges-row">
        <div className="badge-tag">
          {language === 'tr' ? "A'dan Z'ye kelime oyunu" : "A to Z word game"}
        </div>
        <div className="badge-ai">
          {language === 'tr' ? 'Yapay zeka: ' : 'AI: '}
          <span>{activeProvider.name} · {activeModel.split('/').pop()}</span>
        </div>
      </div>

      {/* Main PAROLLA block logo */}
      <div className="parolla-logo-row">
        {'PAROLLA'.split('').map((char, index) => (
          <div key={index} className="logo-letter-box">
            <span className="logo-letter">{char}</span>
          </div>
        ))}
      </div>

      {/* Subtitle */}
      <p className="landing-subtitle">
        {language === 'tr'
          ? 'İstediğin konuyu yaz ya da bir tema seç; yapay zeka alfabetik sırayla Parolla sorularını hazırlasın.'
          : 'Type any topic or pick a theme; AI will generate alphabetical Parolla questions instantly.'}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="landing-form">
        {/* Underline Input */}
        <div className="input-line-wrapper">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              language === 'tr'
                ? "Örn: 90'lar pop kültürü, dünya tarihi, yazılım…"
                : "e.g., 90s pop culture, world history, computer science…"
            }
            className="input-underline"
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Popular topics */}
        <div className="popular-topics-container">
          <span className="popular-label">
            {language === 'tr' ? 'Popüler konular' : 'Popular topics'}
          </span>
          <div className="popular-rows">
            {topicsRows.map((row, rowIdx) => (
              <div key={rowIdx} className="topics-button-row">
                {row.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectTopic(item)}
                    className={`topic-btn ${prompt === item ? 'selected' : ''}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Language & Question count panel */}
        <div className="options-panel">
          <div className="lang-toggle-group">
            <button
              type="button"
              onClick={() => setLanguage('tr')}
              className={`option-btn ${language === 'tr' ? 'active' : ''}`}
            >
              Türkçe
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`option-btn ${language === 'en' ? 'active' : ''}`}
            >
              English
            </button>
          </div>

          <div className="count-toggle-group">
            {countOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setQuestionCount(opt.value)}
                className={`option-btn ${questionCount === opt.value ? 'active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashed Start Button */}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`dashed-start-btn ${isLoading ? 'loading' : ''}`}
        >
          {isLoading
            ? (language === 'tr' ? 'Hazırlanıyor...' : 'Generating...')
            : (language === 'tr' ? "Parolla'yı başlat" : 'Start Parolla')}
        </button>

        <span className="start-hint">
          {language === 'tr'
            ? 'Başlamak için bir konu yaz ya da seç.'
            : 'Type or choose a topic to begin.'}
        </span>
      </form>

      <style>{`
        .landing-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 760px;
          padding: var(--spacing-6) var(--spacing-4);
          user-select: none;
        }

        /* Top Badges */
        .top-badges-row {
          display: flex;
          gap: var(--spacing-3);
          margin-bottom: var(--spacing-8);
          flex-wrap: wrap;
          justify-content: center;
        }

        .badge-tag {
          background: #ffffff;
          border: 1.5px solid #0f172a;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          box-shadow: 1px 1px 0px #0f172a;
        }

        .badge-ai {
          background: #e9f0fe;
          border: 1.5px solid #2563eb;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1d4ed8;
          box-shadow: 1px 1px 0px #2563eb;
        }

        .badge-ai span {
          font-weight: 700;
        }

        /* PAROLLA Letter Blocks */
        .parolla-logo-row {
          display: flex;
          gap: 12px;
          margin-bottom: var(--spacing-6);
          justify-content: center;
          flex-wrap: wrap;
        }

        .logo-letter-box {
          width: 66px;
          height: 76px;
          background: #0f1f3d;
          border: 1.5px solid #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 5px 5px 0px #2563eb;
          transition: transform 0.15s ease;
        }

        .logo-letter-box:hover {
          transform: translateY(-2px);
        }

        .logo-letter {
          font-family: var(--font-serif);
          font-size: 3.4rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
        }

        /* Subtitle */
        .landing-subtitle {
          font-size: 1.05rem;
          color: #334155;
          max-width: 500px;
          line-height: 1.55;
          margin-bottom: var(--spacing-8);
          font-weight: 500;
        }

        /* Form */
        .landing-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-5);
        }

        /* Underline Input */
        .input-line-wrapper {
          width: 100%;
          margin-bottom: var(--spacing-2);
        }

        .input-underline {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid #2563eb;
          padding: 10px 4px;
          font-size: 1.25rem;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          font-family: var(--font-sans);
          transition: border-color 0.2s;
        }

        .input-underline::placeholder {
          color: #64748b;
          font-size: 1.15rem;
          font-weight: 400;
        }

        .input-underline:focus {
          border-bottom-width: 2.5px;
          border-bottom-color: #1d4ed8;
        }

        /* Popular Topics */
        .popular-topics-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          gap: 6px;
        }

        .popular-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
        }

        .popular-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .topics-button-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .topic-btn {
          background: #ffffff;
          border: 1.5px solid #0f172a;
          padding: 8px 16px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          box-shadow: 1px 1px 0px #0f172a;
          transition: all 0.15s ease;
        }

        .topic-btn:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
        }

        .topic-btn.selected {
          background: #0f1f3d;
          color: #ffffff;
        }

        /* Options Panel */
        .options-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          border: 1.5px solid #0f172a;
          padding: 8px;
          box-shadow: 2px 2px 0px #0f172a;
          flex-wrap: wrap;
          gap: var(--spacing-3);
        }

        .lang-toggle-group, .count-toggle-group {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .option-btn {
          background: #ffffff;
          border: 1.5px solid #0f172a;
          padding: 7px 14px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .option-btn:hover {
          background: #f1f5f9;
        }

        .option-btn.active {
          background: #0f1f3d;
          color: #ffffff;
          border-color: #0f1f3d;
        }

        /* Dashed Start Button */
        .dashed-start-btn {
          width: 100%;
          background: #d8e0e4;
          border: 2px dashed #0f172a;
          padding: 18px;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-sans);
          letter-spacing: 0.02em;
        }

        .dashed-start-btn:hover:not(:disabled) {
          background: #ccd7dc;
          border-style: solid;
          transform: translateY(-1px);
        }

        .dashed-start-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .start-hint {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: -4px;
        }

        @media (max-width: 680px) {
          .parolla-logo-row {
            gap: 6px;
          }
          .logo-letter-box {
            width: 44px;
            height: 52px;
            box-shadow: 3px 3px 0px #2563eb;
          }
          .logo-letter {
            font-size: 2.2rem;
          }
          .options-panel {
            flex-direction: column;
            align-items: stretch;
          }
          .lang-toggle-group, .count-toggle-group {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
