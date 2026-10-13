import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import LetterTrack from './LetterTrack';
import QuestionCard from './QuestionCard';

const translations = {
  tr: {
    time: "Süre",
    score: "Doğru",
    gameOver: "Oyun Bitti!",
    timeLeft: "Kalan Süre",
    playAgain: "Tekrar Oyna",
    finish: "Oyunu bitir",
    correct: "Doğru",
    wrong: "Yanlış",
    passed: "Pas",
    accuracy: "Başarı Oranı",
    yourAnswer: "Senin Cevabın",
    correctAnswer: "Doğru Cevap",
    allQuestionsReview: "Soru & Cevap Detayları",
    excellent: "Mükemmel Performans!",
    great: "Harika Sonuç!",
    goodTry: "İyi Deneme! Devam Et!"
  },
  en: {
    time: "Time",
    score: "Score",
    gameOver: "Game Over!",
    timeLeft: "Time Left",
    playAgain: "Play Again",
    finish: "Finish Game",
    correct: "Correct",
    wrong: "Wrong",
    passed: "Passed",
    accuracy: "Accuracy",
    yourAnswer: "Your Answer",
    correctAnswer: "Correct Answer",
    allQuestionsReview: "Questions & Answers",
    excellent: "Outstanding Performance!",
    great: "Great Job!",
    goodTry: "Good Effort!"
  }
};

const normalizeText = (text, lang) => {
  if (!text) return '';
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  return text
    .trim()
    .toLocaleLowerCase(locale)
    .replace(/['"«»“”„.,!?;:\-–—()]/g, '')
    .replace(/\s+/g, ' ');
};

const GameManager = ({ gameData, onRestart, language = 'tr' }) => {
  const initialTime = Math.max(90, gameData.length * 15);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({}); // { [index]: 'correct' | 'wrong' | 'passed' }
  const [userAnswers, setUserAnswers] = useState({}); // { [index]: string }
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'finished'
  const [score, setScore] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null); // { isCorrect: bool, text: string }

  const t = translations[language];

  const endGame = useCallback(() => {
    setGameState('finished');
    if (score >= Math.ceil(gameData.length * 0.6)) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 }
      });
    }
  }, [score, gameData.length]);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, endGame]);

  // Move to next pending or passed question
  const moveToNextQuestion = useCallback((startIndex) => {
    let nextIndex = startIndex + 1;
    let loopCount = 0;

    while (loopCount < gameData.length) {
      if (nextIndex >= gameData.length) nextIndex = 0;

      // Select if not answered yet, or was previously passed
      if (!results[nextIndex] || results[nextIndex] === 'passed') {
        setCurrentIndex(nextIndex);
        return;
      }

      nextIndex++;
      loopCount++;
    }

    // All questions answered
    endGame();
  }, [gameData.length, results, endGame]);

  const handleAnswer = (userAnswer) => {
    const currentItem = gameData[currentIndex];
    const cleanedUserAnswer = normalizeText(userAnswer, language);
    const cleanedCorrectAnswer = normalizeText(currentItem.answer, language);

    // Exact check with primary answer
    let isCorrect = cleanedUserAnswer === cleanedCorrectAnswer;

    // Check with aliases if primary didn't match
    if (!isCorrect && Array.isArray(currentItem.aliases) && currentItem.aliases.length > 0) {
      isCorrect = currentItem.aliases.some(
        (alias) => normalizeText(alias, language) === cleanedUserAnswer
      );
    }

    // Optional demo fallback
    if (!isCorrect && ['word', 'kelime'].includes(cleanedCorrectAnswer)) {
      isCorrect = cleanedUserAnswer.startsWith(currentItem.letter.toLocaleLowerCase(language));
    }

    const newResults = {
      ...results,
      [currentIndex]: isCorrect ? 'correct' : 'wrong'
    };

    setResults(newResults);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: userAnswer }));

    if (isCorrect) {
      setScore((s) => s + 1);
      setLastFeedback({
        isCorrect: true,
        text: language === 'tr'
          ? `Önceki: ${currentItem.letter} — doğru!`
          : `Previous: ${currentItem.letter} — correct!`
      });
    } else {
      setLastFeedback({
        isCorrect: false,
        text: language === 'tr'
          ? `Önceki: ${currentItem.letter} — cevap "${currentItem.answer}" idi`
          : `Previous: ${currentItem.letter} — answer was "${currentItem.answer}"`
      });
    }

    moveToNextQuestion(currentIndex);
  };

  const handlePass = () => {
    const currentItem = gameData[currentIndex];
    setResults((prev) => ({ ...prev, [currentIndex]: 'passed' }));
    setLastFeedback({
      isCorrect: false,
      text: language === 'tr'
        ? `Önceki: ${currentItem.letter} — pas geçildi`
        : `Previous: ${currentItem.letter} — passed`
    });
    moveToNextQuestion(currentIndex);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const letters = gameData.map((item) => item.letter);
  const currentItem = gameData[currentIndex];

  const correctCount = Object.values(results).filter(r => r === 'correct').length;
  const wrongCount = Object.values(results).filter(r => r === 'wrong').length;
  const passedCount = Object.values(results).filter(r => r === 'passed').length;

  if (gameState === 'finished') {
    return (
      <div className="game-over-editorial">
        <div className="game-over-box">
          <h2 className="game-over-title">{t.gameOver}</h2>
          
          <div className="score-boxes-summary">
            <div className="summary-stat-box">
              <span className="stat-label">{t.score}</span>
              <span className="stat-val">{score} / {gameData.length}</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">{t.correct}</span>
              <span className="stat-val correct-color">{correctCount}</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">{t.wrong}</span>
              <span className="stat-val wrong-color">{wrongCount}</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">{t.passed}</span>
              <span className="stat-val passed-color">{passedCount}</span>
            </div>
            <div className="summary-stat-box">
              <span className="stat-label">{t.timeLeft}</span>
              <span className="stat-val">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="results-list-container">
            <h3 className="review-title">{t.allQuestionsReview}</h3>
            <div className="review-items-scroll">
              {gameData.map((item, index) => {
                const status = results[index] || 'pending';
                const userAns = userAnswers[index];
                return (
                  <div key={index} className={`review-row-item ${status}`}>
                    <span className="row-letter">{item.letter}</span>
                    <div className="row-content">
                      <p className="row-q">{item.question}</p>
                      <div className="row-answers">
                        <span className="row-correct-ans">
                          <strong>{t.correctAnswer}:</strong> {item.answer}
                          {Array.isArray(item.aliases) && item.aliases.length > 0 && (
                            <small className="alias-tag"> ({item.aliases.join(', ')})</small>
                          )}
                        </span>
                        {userAns && (
                          <span className="row-user-ans">
                            <strong>{t.yourAnswer}:</strong> {userAns}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`status-pill ${status}`}>{t[status] || status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={onRestart} className="btn-play-again">
            {t.playAgain}
          </button>
        </div>

        <style>{`
          .game-over-editorial {
            width: 100%;
            max-width: 820px;
            padding: var(--spacing-4);
          }

          .game-over-box {
            background: #ffffff;
            border: 1.5px solid #0f172a;
            box-shadow: 4px 4px 0px #0f172a;
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .game-over-title {
            font-family: var(--font-serif);
            font-size: 2.2rem;
            font-weight: 900;
            color: #0f172a;
            text-align: center;
          }

          .score-boxes-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 12px;
          }

          .summary-stat-box {
            background: #f1f5f9;
            border: 1.5px solid #0f172a;
            padding: 12px;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .stat-label {
            font-size: 0.78rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
          }

          .stat-val {
            font-size: 1.5rem;
            font-weight: 900;
            font-family: var(--font-sans);
            color: #0f172a;
          }

          .stat-val.correct-color { color: #15803d; }
          .stat-val.wrong-color { color: #dc2626; }
          .stat-val.passed-color { color: #d97706; }

          .review-title {
            font-size: 1.05rem;
            font-weight: 700;
            margin-bottom: 10px;
            color: #0f172a;
          }

          .review-items-scroll {
            max-height: 320px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-right: 6px;
          }

          .review-row-item {
            display: flex;
            align-items: center;
            gap: 16px;
            border: 1.5px solid #0f172a;
            padding: 10px 14px;
            background: #ffffff;
          }

          .review-row-item.correct { border-left: 6px solid #15803d; }
          .review-row-item.wrong { border-left: 6px solid #dc2626; }
          .review-row-item.passed { border-left: 6px solid #d97706; }

          .row-letter {
            font-family: var(--font-serif);
            font-size: 1.8rem;
            font-weight: 900;
            min-width: 32px;
            text-align: center;
          }

          .row-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .row-q {
            font-size: 0.95rem;
            font-weight: 600;
            color: #0f172a;
          }

          .row-answers {
            display: flex;
            gap: 16px;
            font-size: 0.84rem;
            flex-wrap: wrap;
          }

          .row-correct-ans { color: #15803d; }
          .row-user-ans { color: #64748b; }
          .alias-tag { color: #64748b; opacity: 0.85; }

          .status-pill {
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 4px 8px;
            border: 1px solid #0f172a;
          }

          .status-pill.correct { background: #dcfce7; color: #15803d; }
          .status-pill.wrong { background: #fee2e2; color: #dc2626; }
          .status-pill.passed { background: #fef3c7; color: #b45309; }

          .btn-play-again {
            background: #2563eb;
            color: #ffffff;
            border: 1.5px solid #0f172a;
            padding: 14px 28px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 2px 2px 0px #0f172a;
            align-self: center;
            transition: all 0.15s ease;
          }

          .btn-play-again:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="game-screen-container">
      {/* Header Bar matching Page 1 screenshot */}
      <header className="game-top-bar">
        {/* Left: Serif Logo */}
        <h1 className="game-logo">Parolla</h1>

        {/* Center: Time & Score Boxes */}
        <div className="stat-boxes-group">
          <div className="box-stat">
            <span className="box-label">{t.time}</span>
            <span className="box-val">{formatTime(timeLeft)}</span>
          </div>

          <div className="box-stat">
            <span className="box-label">{t.score}</span>
            <span className="box-val">{score} / {gameData.length}</span>
          </div>
        </div>

        {/* Right: End Game Button */}
        <button onClick={endGame} className="btn-finish-game">
          {t.finish}
        </button>
      </header>

      {/* Middle: Active Letter & Question Card */}
      <main className="game-middle-area">
        <QuestionCard
          letter={currentItem.letter}
          question={currentItem.question}
          onAnswer={handleAnswer}
          onPass={handlePass}
          lastFeedback={lastFeedback}
          language={language}
        />
      </main>

      {/* Bottom: Horizontal Letter Strip */}
      <footer className="game-bottom-strip">
        <LetterTrack
          letters={letters}
          currentIndex={currentIndex}
          results={results}
        />
      </footer>

      <style>{`
        .game-screen-container {
          width: 100%;
          max-width: 980px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 8px 12px;
          user-select: none;
        }

        /* Top Bar */
        .game-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 16px;
        }

        .game-logo {
          font-family: var(--font-serif);
          font-size: 2.1rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }

        .stat-boxes-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .box-stat {
          background: #dce3e6;
          border: 1.5px solid #0f172a;
          padding: 4px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 90px;
          box-shadow: 1px 1px 0px #0f172a;
        }

        .box-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #475569;
          line-height: 1.2;
        }

        .box-val {
          font-family: var(--font-sans);
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .btn-finish-game {
          border: 1.5px solid #0f172a;
          background: #dce3e6;
          padding: 10px 20px;
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          box-shadow: 1px 1px 0px #0f172a;
          transition: all 0.15s ease;
          font-family: var(--font-sans);
        }

        .btn-finish-game:hover {
          background: #cbd5e1;
        }

        /* Middle Area */
        .game-middle-area {
          width: 100%;
          margin: 6px 0;
        }

        /* Bottom Strip */
        .game-bottom-strip {
          width: 100%;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .game-top-bar {
            flex-wrap: wrap;
          }
          .btn-finish-game {
            margin-left: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default GameManager;
