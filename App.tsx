
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PublicBooking } from './pages/PublicBooking';
import { Settings } from './pages/Settings';
import { Professionals } from './pages/Professionals';
import { Appointments } from './pages/Appointments';
import { Services } from './pages/Services';
import { Revenue } from './pages/Revenue';
import { SocialLinks } from './pages/SocialLinks';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Admin Dashboard Routes */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
        <Route path="/professionals" element={<Layout><Professionals /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/revenue" element={<Layout><Revenue /></Layout>} />
        <Route path="/social" element={<Layout><SocialLinks /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        
        {/* Public Booking Route */}
        <Route path="/booking/:slug" element={<PublicBooking />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
