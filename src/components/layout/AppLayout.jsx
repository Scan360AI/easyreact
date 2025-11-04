import React from 'react';
import Navbar from './Navbar';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        {children}
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 FinReport Dashboard. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default AppLayout;
