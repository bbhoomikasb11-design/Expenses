import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDashboard from './pages/GroupDashboard';
import SettleUp from './pages/SettleUp';
import { GroupProvider } from './context/GroupContext';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" 
        toastOptions={{
          style: {
            background: '#13131A',
            color: '#fff',
            border: '1px solid #00F5A0'
          }
        }} 
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateGroup />} />
        
        <Route element={<GroupProvider />}>
          <Route path="/group/:id" element={<GroupDashboard />} />
          <Route path="/settle/:id" element={<SettleUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
