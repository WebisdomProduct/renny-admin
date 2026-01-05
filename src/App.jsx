import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';

import Dashboard from './pages/Dashboard';
import Blogs from './pages/Blogs';
import News from './pages/News';
import Events from './pages/Events';
import Careers from './pages/Careers';
import Contacts from './pages/Contacts';
import InvestorRelations from './pages/InvestorRelations';

// Investor Relations pages
import Financials from './pages/Financial';
import CorporateGovernance from './pages/CorporateGovernance';
import IndustryReport from './pages/IndustryReport';
import IPODocuments from './pages/IPODocuments';
import IPOAudioVisual from './pages/IPAudioVisual';
import ShareHoldingPattern from './pages/ShareHoldingPattern';
import OurPolicies from './pages/OurPolicies';

const App = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        {/* Main pages */}
        <Route index element={<Dashboard />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="news" element={<News />} />
        <Route path="events" element={<Events />} />
        <Route path="careers" element={<Careers />} />
        <Route path="contacts" element={<Contacts />} />

        {/* Investor Relations */}
        <Route path="investors" element={<InvestorRelations />} />
        <Route path="financials" element={<Financials />} />
        <Route path="corporate-governance" element={<CorporateGovernance />} />
        <Route path="industry-report" element={<IndustryReport />} />
        <Route path="ipo" element={<IPODocuments />} />
        <Route path="ipo-audio-visual" element={<IPOAudioVisual />} />
        <Route path="share-holding-pattern" element={<ShareHoldingPattern />} />
        <Route path="our-policies" element={<OurPolicies />} />
      </Route>
    </Routes>
  );
};

export default App;
