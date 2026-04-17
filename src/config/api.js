// Central API configuration — driven by environment variables.
// Set VITE_API_BASE_URL in .env (dev) or .env.production (prod).
const BASE = import.meta.env.VITE_API_BASE_URL;

export const API = {
  // ─── Upload ───────────────────────────────────────────────────────────────
  UPLOAD:               `${BASE}/cms/upload`,

  // ─── Auth ─────────────────────────────────────────────────────────────────
  AUTH_LOGIN:           `${BASE}/cms/auth/login`,
  AUTH_REGISTER:        `${BASE}/cms/auth/register`,
  AUTH_ADMINS:          `${BASE}/cms/auth/admins`,
  AUTH_CHANGE_PASSWORD: `${BASE}/cms/auth/change-password`,

  // ─── CMS routes ───────────────────────────────────────────────────────────
  CMS_NEWS:             `${BASE}/cms/news`,
  CMS_EVENTS:           `${BASE}/cms/events`,
  CMS_CONTACT:          `${BASE}/cms/contact`,
  CMS_CAREER:           `${BASE}/cms/career`,
  CMS_FINANCIALS:       `${BASE}/cms/financials`,
  CMS_POLICIES:         `${BASE}/cms/policies`,
  CMS_GOVERNANCE:       `${BASE}/cms/governance`,
  CMS_SHAREHOLDING:     `${BASE}/cms/shareholding-pattern`,
  CMS_IPO_DOCS:         `${BASE}/cms/ipo-documents`,
  CMS_IPO_AV:           `${BASE}/cms/ipo-av`,
  CMS_INDUSTRY_REPORT:  `${BASE}/cms/industry-report`,
  CMS_PAGE:             `${BASE}/cms/page`,
  CMS_TIMELINE:         `${BASE}/cms/timeline`,
  CMS_UNITS:            `${BASE}/cms/units`,
  CMS_SPECIFICATIONS:   `${BASE}/cms/specifications`,
  CMS_ESG_PROJECTS:     `${BASE}/cms/esg-projects`,
  CMS_SUCCESS_STORIES:  `${BASE}/cms/success-stories`,
  CMS_PLANTS:           `${BASE}/cms/plants`,
  CMS_BLOGS:            `${BASE}/cms/blogs`,
  CMS_PRODUCT_CONTENT:  `${BASE}/cms/product-content`,
  CMS_SCAFFOLDING:      `${BASE}/cms/scaffolding`,
  CMS_DESIGN_CENTRE:    `${BASE}/cms/design-centre`,
  CMS_CONTACT_INFO:     `${BASE}/cms/contact-info`,


  // ─── Public API routes ────────────────────────────────────────────────────
  API_FINANCIALS:       `${BASE}/api/financials`,
  API_POLICIES:         `${BASE}/api/policies`,
  API_GOVERNANCE:       `${BASE}/api/governance`,
  API_SHAREHOLDING:     `${BASE}/api/shareholding-pattern`,
  API_IPO_DOCS:         `${BASE}/api/ipo-documents`,
  API_IPO_AV:           `${BASE}/api/ipo-av`,
  API_INDUSTRY_REPORT:  `${BASE}/api/industry-report`,
  API_NEWSLETTER:       `${BASE}/api/newsletter/admin/subscribers`,
  API_CERTIFICATES:     `${BASE}/api/certificates`,
  API_SCAFFOLDING:      `${BASE}/api/scaffolding`,
  API_DESIGN_CENTRE:    `${BASE}/api/design-centre`,
  API_CONTACT_INFO:     `${BASE}/api/contact-info`,

};
