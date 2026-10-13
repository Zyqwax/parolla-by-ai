import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <main className="main-content">
        {children}
      </main>

      <style>{`
        .layout-container {
          min-height: 100vh;
          width: 100%;
          background: var(--color-bg);
          color: var(--color-text);
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-6) var(--spacing-4);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 640px) {
          .main-content {
            padding: var(--spacing-3) var(--spacing-2);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
