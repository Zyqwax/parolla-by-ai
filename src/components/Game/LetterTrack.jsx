import React from 'react';

const LetterTrack = ({ letters, currentIndex, results = {} }) => {
  return (
    <div className="letter-track-container">
      <div className="letter-track">
        {letters.map((letter, index) => {
          let status = 'pending';
          if (results[index]) {
            status = results[index]; // 'correct', 'wrong', 'passed'
          } else if (index === currentIndex) {
            status = 'current';
          }

          return (
            <div
              key={`${letter}-${index}`}
              className={`track-cell ${status}`}
            >
              <span className="cell-number">{index + 1}</span>
              <span className="cell-letter">{letter}</span>
              {status === 'wrong' && <span className="cross-line" />}
            </div>
          );
        })}
      </div>

      <style>{`
        .letter-track-container {
          width: 100%;
          overflow-x: auto;
          padding: 12px 0 4px 0;
          scrollbar-width: thin;
        }

        .letter-track {
          display: flex;
          width: 100%;
          min-width: fit-content;
          border: 1.5px solid #0f172a;
          background: #d4dde1;
          box-shadow: 2px 2px 0px #0f172a;
        }

        .track-cell {
          flex: 1;
          min-width: 64px;
          height: 90px;
          border-right: 1.5px solid #0f172a;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #d4dde1;
          color: #475569;
          transition: transform 0.15s ease;
          user-select: none;
        }

        .track-cell:last-child {
          border-right: none;
        }

        .cell-number {
          position: absolute;
          top: 4px;
          left: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          line-height: 1;
          font-family: var(--font-sans);
          opacity: 0.8;
        }

        .cell-letter {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1;
        }

        /* Status: CURRENT (Active) */
        .track-cell.current {
          background: #0f1f3d !important;
          color: #ffffff !important;
          transform: translateY(-8px);
          z-index: 10;
          height: 98px;
          box-shadow: 0px 8px 0px #2563eb;
          border-top: 1.5px solid #0f172a;
          border-bottom: 1.5px solid #0f172a;
        }

        .track-cell.current .cell-number {
          color: #94a3b8;
          opacity: 1;
        }

        /* Status: CORRECT (Green) */
        .track-cell.correct {
          background: #15803d !important;
          color: #ffffff !important;
        }

        .track-cell.correct .cell-number {
          color: #bbf7d0;
        }

        /* Status: WRONG (Red with diagonal strike) */
        .track-cell.wrong {
          background: #dc2626 !important;
          color: #ffffff !important;
          overflow: hidden;
        }

        .track-cell.wrong .cell-number {
          color: #fecaca;
        }

        .cross-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: linear-gradient(
            to top right,
            transparent calc(50% - 1.5px),
            #ffffff calc(50% - 1.5px),
            #ffffff calc(50% + 1.5px),
            transparent calc(50% + 1.5px)
          );
        }

        /* Status: PASSED (Amber striped pattern) */
        .track-cell.passed {
          background: repeating-linear-gradient(
            45deg,
            #d97706,
            #d97706 6px,
            #b45309 6px,
            #b45309 12px
          ) !important;
          color: #0f172a !important;
        }

        .track-cell.passed .cell-letter {
          color: #000000;
          text-shadow: 0 0 1px rgba(255, 255, 255, 0.4);
        }

        .track-cell.passed .cell-number {
          color: #0f172a;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .track-cell {
            min-width: 48px;
            height: 72px;
          }
          .cell-letter {
            font-size: 1.6rem;
          }
          .track-cell.current {
            height: 80px;
            transform: translateY(-6px);
            box-shadow: 0px 6px 0px #2563eb;
          }
        }
      `}</style>
    </div>
  );
};

export default LetterTrack;
