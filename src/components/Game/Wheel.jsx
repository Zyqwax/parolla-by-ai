import React from 'react';
import { motion } from 'framer-motion';

const Wheel = ({ letters, currentIndex, results = {} }) => {
  const totalLetters = letters.length;
  // Calculate dynamic radius and sizing based on letter count
  const radius = totalLetters > 20 ? 220 : 205;
  const nodeSize = totalLetters > 20 ? 38 : totalLetters > 14 ? 42 : 46;
  const fontSize = totalLetters > 20 ? '0.95rem' : '1.15rem';
  const step = 360 / totalLetters;

  return (
    <div className="wheel-container">
      <div className="wheel">
        {letters.map((letter, index) => {
          // Angle starts at top (12 o'clock = -90deg in cartesian coords) and proceeds clockwise
          const angle = (index * step) - 90;
          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);
          
          let status = 'pending';
          if (results[index]) {
            status = results[index]; // 'correct', 'wrong', 'passed'
          } else if (index === currentIndex) {
            status = 'current';
          }

          return (
            <motion.div
              key={`${letter}-${index}`}
              className={`letter-node ${status}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: status === 'current' ? 1.25 : 1,
              }}
              transition={{ 
                delay: index * 0.02,
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
              style={{
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                width: `${nodeSize}px`,
                height: `${nodeSize}px`,
                fontSize: fontSize,
              }}
            >
              <span className="letter-content">{letter}</span>
              {status === 'current' && <span className="active-glow-ring" />}
            </motion.div>
          );
        })}
        
        {/* Center hub with centered Parolla branding */}
        <div className="center-hub">
          <div className="hub-inner">
            <span className="hub-badge">PAROLLA</span>
            <span className="hub-progress">
              {currentIndex + 1} / {totalLetters}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .wheel-container {
          position: relative;
          width: 520px;
          height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .wheel {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .letter-node {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          font-family: inherit;
          font-weight: 800;
          color: var(--color-text-muted);
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        .letter-node.current {
          border-color: var(--color-accent);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(168, 85, 247, 0.4));
          color: #ffffff;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(168, 85, 247, 0.4);
          z-index: 10;
        }

        .active-glow-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--color-accent);
          animation: ringPulse 1.5s ease-out infinite;
          pointer-events: none;
        }

        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .letter-node.correct {
          background: #16a34a;
          border-color: #22c55e;
          color: #ffffff;
          box-shadow: 0 0 14px rgba(34, 197, 94, 0.6);
        }

        .letter-node.wrong {
          background: #dc2626;
          border-color: #ef4444;
          color: #ffffff;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.6);
        }

        .letter-node.passed {
          background: #ca8a04;
          border-color: #eab308;
          color: #ffffff;
          box-shadow: 0 0 14px rgba(234, 179, 8, 0.6);
        }

        .center-hub {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30, 18, 45, 0.95) 0%, rgba(15, 7, 21, 0.95) 100%);
          border: 2px solid rgba(168, 85, 247, 0.25);
          box-shadow: 0 0 35px rgba(168, 85, 247, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 0;
        }

        .hub-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .hub-badge {
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hub-progress {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-text-muted);
          font-family: monospace;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .wheel-container {
            width: 360px;
            height: 360px;
          }
          .wheel {
            transform: scale(0.68);
            transform-origin: center center;
          }
        }
      `}</style>
    </div>
  );
};

export default Wheel;
