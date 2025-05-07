import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 