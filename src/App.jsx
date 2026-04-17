import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Blogs = lazy(() => import('./pages/Blogs'));
const News = lazy(() => import('./pages/News'));
const Events = lazy(() => import('./pages/Events'));
const Careers = lazy(() => import('./pages/Careers'));
const Contacts = lazy(() => import('./pages/Contacts'));
const InvestorRelations = lazy(() => import('./pages/InvestorRelations'));
const Newsletter = lazy(() => import('./pages/NewsletterAdmin'));
const Financials = lazy(() => import('./pages/Financial'));
const CorporateGovernance = lazy(() => import('./pages/CorporateGovernance'));
const IndustryReport = lazy(() => import('./pages/IndustryReport'));
const IPODocuments = lazy(() => import('./pages/IPODocuments'));
const IPOAudioVisual = lazy(() => import('./pages/IPAudioVisual'));
const ShareHoldingPattern = lazy(() => import('./pages/ShareHoldingPattern'));
const OurPolicies = lazy(() => import('./pages/OurPolicies'));
const SustainabilityLeads = lazy(() => import('./pages/SustainabilityLeads'));
const CertificateAdmin = lazy(() => import('./pages/CertificateAdmin'));
const ManageRoles = lazy(() => import('./pages/ManageRoles'));
const CreateAdmin = lazy(() => import('./pages/CreateAdmin'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Login = lazy(() => import('./pages/Login'));
const PageSectionsAdmin = lazy(() => import('./pages/PageSectionsAdmin'));
const TimelineAdmin = lazy(() => import('./pages/TimelineAdmin'));
const UnitsAdmin = lazy(() => import('./pages/UnitsAdmin'));
const SpecificationsAdmin = lazy(() => import('./pages/SpecificationsAdmin'));
const EsgProjectsAdmin = lazy(() => import('./pages/EsgProjectsAdmin'));
const SuccessStoriesAdmin = lazy(() => import('./pages/SuccessStoriesAdmin'));
const PlantsAdmin = lazy(() => import('./pages/PlantsAdmin'));
const ProductContentAdmin = lazy(() => import('./pages/ProductContentAdmin'));
const ScaffoldingAdmin = lazy(() => import('./pages/ScaffoldingAdmin'));
const DesignCentreAdmin = lazy(() => import('./pages/DesignCentreAdmin'));
const ContactInfoAdmin = lazy(() => import('./pages/ContactInfoAdmin'));

const AppLoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-4 py-6">
    <div className="h-16 w-16 rounded-3xl bg-slate-100 animate-pulse" />
    <div className="space-y-3 w-full max-w-md">
      <div className="h-4 rounded-full bg-slate-200 animate-pulse" />
      <div className="h-4 w-5/6 rounded-full bg-slate-200 animate-pulse" />
      <div className="h-4 w-2/3 rounded-full bg-slate-200 animate-pulse" />
    </div>
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<AppLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="news" element={<News />} />
            <Route path="events" element={<Events />} />
            <Route path="careers" element={<Careers />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="sustainability-leads" element={<SustainabilityLeads />} />
            <Route path="certificate-admin" element={<CertificateAdmin />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="roles" element={<ManageRoles />} />
            <Route path="create-admin" element={<CreateAdmin />} />
            <Route path="page-sections" element={<PageSectionsAdmin />} />
            <Route path="timeline" element={<TimelineAdmin />} />
            <Route path="units" element={<UnitsAdmin />} />
            <Route path="specifications" element={<SpecificationsAdmin />} />
            <Route path="esg-projects" element={<EsgProjectsAdmin />} />
            <Route path="success-stories" element={<SuccessStoriesAdmin />} />
            <Route path="plants" element={<PlantsAdmin />} />
            <Route path="product-content" element={<ProductContentAdmin />} />
            <Route path="scaffolding" element={<ScaffoldingAdmin />} />
            <Route path="design-centre" element={<DesignCentreAdmin />} />
            <Route path="contact-info" element={<ContactInfoAdmin />} />
            <Route path="investors" element={<InvestorRelations />} />
            <Route path="financials" element={<Financials />} />
            <Route path="corporate-governance" element={<CorporateGovernance />} />
            <Route path="industry-report" element={<IndustryReport />} />
            <Route path="ipo" element={<IPODocuments />} />
            <Route path="ipo-audio-visual" element={<IPOAudioVisual />} />
            <Route path="share-holding-pattern" element={<ShareHoldingPattern />} />
            <Route path="our-policies" element={<OurPolicies />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
