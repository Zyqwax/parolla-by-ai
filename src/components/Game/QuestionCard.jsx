import React, { useState, useEffect, useRef } from 'react';

const QuestionCard = ({
  letter,
  question,
  onAnswer,
  onPass,
  lastFeedback,
  language = 'tr'
}) => {
  const [answer, setAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    setAnswer('');
    setErrorMessage('');

    focusInput();
    const frameId = requestAnimationFrame(focusInput);
    const timer1 = setTimeout(focusInput, 50);
    const timer2 = setTimeout(focusInput, 200);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [letter, question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = answer.trim();

    // If submitted empty, treat as pass
    if (!trimmed) {
      onPass();
      return;
    }

    // Validation: Answer must start with target letter
    const answerFirstChar = trimmed.charAt(0).toLocaleLowerCase(locale);
    const targetFirstChar = letter.toLocaleLowerCase(locale);

    if (answerFirstChar !== targetFirstChar) {
      setErrorMessage(
        language === 'tr'
          ? `Cevap "${letter}" harfi ile başlamalı!`
          : `Answer must start with "${letter}"!`
      );
      setTimeout(() => setErrorMessage(''), 2500);
      return;
    }

    onAnswer(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onPass();
    }
  };

  const labels = {
    pass: language === 'tr' ? 'Pas geç' : 'Pass',
    answer: language === 'tr' ? 'Cevapla' : 'Submit',
    hint: language === 'tr' ? 'Bu harfle başlayan cevap' : 'Answer starting with this letter',
  };

  return (
    <div className="game-card-pair" onClick={focusInput}>
      {/* Left Box: Huge Letter in Navy Block with Blue Offset Shadow */}
      <div className="letter-block">
        <span className="huge-letter">{letter}</span>
        <span className="letter-caption">{labels.hint}</span>
      </div>

      {/* Right Box: White Question & Answer Box */}
      <div className="question-content-box">
        {/* Question Text */}
        <h2 className="question-heading">{question}</h2>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="question-form">
          <div className="input-underline-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={answer}
              autoFocus
              onChange={(e) => {
                setAnswer(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              onKeyDown={handleKeyDown}
              className={`underline-game-input ${errorMessage ? 'has-error' : ''}`}
              placeholder=""
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Error Message if wrong starting letter */}
          {errorMessage && (
            <div className="input-error-msg">{errorMessage}</div>
          )}

          {/* Previous Question Feedback (as in screenshot: "Önceki: C — cevap "cam" idi") */}
          {lastFeedback && !errorMessage && (
            <div className={`previous-feedback ${lastFeedback.isCorrect ? 'correct' : 'wrong'}`}>
              {lastFeedback.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="card-actions-row">
            <button
              type="button"
              onClick={onPass}
              className="btn-pass-game"
            >
              {labels.pass}
            </button>

            <button
              type="submit"
              className="btn-submit-game"
            >
              {labels.answer}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .game-card-pair {
          display: flex;
          gap: 24px;
          width: 100%;
          align-items: stretch;
        }

        /* Left Navy Block */
        .letter-block {
          width: 230px;
          min-height: 290px;
          background: #0f1f3d;
          border: 1.5px solid #0f172a;
          box-shadow: 6px 6px 0px #2563eb;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 20px 16px 20px;
          user-select: none;
          flex-shrink: 0;
        }

        .huge-letter {
          font-family: var(--font-serif);
          font-size: 8rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          margin-top: 10px;
          text-align: center;
        }

        .letter-caption {
          font-size: 0.76rem;
          color: #94a3b8;
          font-weight: 600;
          text-align: left;
          letter-spacing: 0.02em;
        }

        /* Right Question Box */
        .question-content-box {
          flex: 1;
          background: #ffffff;
          border: 1.5px solid #0f172a;
          box-shadow: 2px 2px 0px #0f172a;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 290px;
        }

        .question-heading {
          font-family: var(--font-serif);
          font-size: 1.7rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.4;
          margin: 0;
          padding-right: 8px;
        }

        .question-form {
          display: flex;
          flex-direction: column;
          margin-top: auto;
          padding-top: 20px;
        }

        .input-underline-wrapper {
          width: 100%;
          border-bottom: 2.5px solid #2563eb;
          margin-bottom: 8px;
        }

        .underline-game-input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 6px 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          outline: none;
          font-family: var(--font-sans);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .underline-game-input.has-error {
          color: #dc2626;
        }

        .input-error-msg {
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        /* Previous feedback text */
        .previous-feedback {
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .previous-feedback.wrong {
          color: #dc2626;
        }

        .previous-feedback.correct {
          color: #15803d;
        }

        /* Buttons Row */
        .card-actions-row {
          display: flex;
          gap: 14px;
          margin-top: 8px;
        }

        .btn-pass-game {
          border: 1.5px solid #0f172a;
          background: #ffffff;
          padding: 12px 28px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          min-width: 130px;
          box-shadow: 1px 1px 0px #0f172a;
          transition: all 0.15s ease;
          font-family: var(--font-sans);
        }

        .btn-pass-game:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
        }

        .btn-submit-game {
          flex: 1;
          background: #2563eb;
          border: 1.5px solid #0f172a;
          padding: 12px 28px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 2px 2px 0px #0f172a;
          transition: all 0.15s ease;
          font-family: var(--font-sans);
        }

        .btn-submit-game:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .game-card-pair {
            flex-direction: column;
            gap: 16px;
          }
          .letter-block {
            width: 100%;
            min-height: auto;
            height: 120px;
            box-shadow: 4px 4px 0px #2563eb;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
          }
          .huge-letter {
            font-size: 4.5rem;
            margin-top: 0;
          }
          .question-content-box {
            padding: 20px;
          }
          .question-heading {
            font-size: 1.35rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QuestionCard;
