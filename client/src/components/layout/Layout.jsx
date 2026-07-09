import React from 'react';

const Layout = ({ children }) => {
  return (
    <>
      <nav style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <h2>The Commons</h2>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
      <footer style={{ padding: '1rem', textAlign: 'center', background: 'white', borderTop: '1px solid #e5e7eb' }}>
        <p>&copy; 2026 The Commons</p>
      </footer>
    </>
  );
};

export default Layout;