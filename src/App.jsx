import React, { useState } from 'react';
import Layout from './components/Layout';
import Landing from './components/Landing';
import GameManager from './components/Game/GameManager';
import { generateQuestions } from './services/aiService';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [language, setLanguage] = useState('tr');
  const [error, setError] = useState(null);

  const handleStartGame = async (userPrompt, selectedLang, questionCount) => {
    setPrompt(userPrompt);
    setLanguage(selectedLang);
    setLoading(true);
    setError(null);
    
    try {
      const data = await generateQuestions(userPrompt, selectedLang, questionCount);
      setGameData(data);
      setGameStarted(true);
    } catch (err) {
      console.error("Failed to generate Parolla questions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameData(null);
    setPrompt(null);
    setError(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <Layout>
      {error && !loading && (
        <div className="error-editorial-container">
          <div className="error-box">
            <h3 className="error-title">
              {language === 'tr' ? 'Bir Hata Oluştu' : 'An Error Occurred'}
            </h3>
            <p className="error-text">{error}</p>
            <button onClick={handleDismissError} className="error-btn">
              {language === 'tr' ? 'Tekrar Dene' : 'Try Again'}
            </button>
          </div>
          <style>{`
            .error-editorial-container {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              max-width: 520px;
              margin: var(--spacing-8) 0;
            }
            .error-box {
              width: 100%;
              background: #fee2e2;
              border: 1.5px solid #0f172a;
              box-shadow: 3px 3px 0px #0f172a;
              padding: 24px;
              text-align: center;
            }
            .error-title {
              font-family: var(--font-serif);
              color: #dc2626;
              font-size: 1.4rem;
              font-weight: 800;
              margin-bottom: 8px;
            }
            .error-text {
              color: #0f172a;
              font-size: 0.95rem;
              margin-bottom: 20px;
              line-height: 1.5;
            }
            .error-btn {
              background: #dc2626;
              color: #ffffff;
              border: 1.5px solid #0f172a;
              padding: 10px 24px;
              font-weight: 700;
              font-size: 0.95rem;
              cursor: pointer;
              box-shadow: 1px 1px 0px #0f172a;
            }
            .error-btn:hover {
              background: #b91c1c;
            }
          `}</style>
        </div>
      )}

      {!gameStarted && !loading && (
        <Landing onStart={handleStartGame} />
      )}

      {loading && (
        <div className="loading-editorial-container">
          <div className="loading-box">
            <div className="loading-spinner-editorial" />
            <h2 className="loading-title">
              {language === 'tr' ? 'Parolla Hazırlanıyor…' : 'Crafting Parolla…'}
            </h2>
            <p className="loading-desc">
              {language === 'tr' 
                ? `"${prompt}" konusu için alfabetik sırada sorular hazırlanıyor` 
                : `Generating alphabetical questions for "${prompt}"`}
            </p>
          </div>

          <style>{`
            .loading-editorial-container {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              max-width: 540px;
              padding: 40px 20px;
            }

            .loading-box {
              background: #ffffff;
              border: 1.5px solid #0f172a;
              box-shadow: 4px 4px 0px #2563eb;
              padding: 40px 32px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              width: 100%;
            }

            .loading-spinner-editorial {
              width: 48px;
              height: 48px;
              border: 3px solid #e2e8f0;
              border-top-color: #0f1f3d;
              border-right-color: #2563eb;
              border-radius: 50%;
              animation: spinEditorial 0.9s linear infinite;
              margin-bottom: 20px;
            }

            .loading-title {
              font-family: var(--font-serif);
              font-size: 1.8rem;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 8px;
            }

            .loading-desc {
              font-size: 1rem;
              color: #475569;
              line-height: 1.5;
            }

            @keyframes spinEditorial {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {gameStarted && gameData && (
        <GameManager 
          gameData={gameData} 
          language={language}
          onRestart={handleRestart} 
        />
      )}
    </Layout>
  );
}

export default App;
