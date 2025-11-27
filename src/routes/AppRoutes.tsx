import { Routes, Route, Navigate } from 'react-router-dom';
// Role constants
const UserRole = {
  Customer: 0,
  Agent: 1,
  Admin: 2,
  Underwriter: 3
} as const;
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import ProductsPage from '../pages/public/ProductsPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Customer Pages
import Dashboard from '../pages/customer/Dashboard';
import PoliciesPage from '../pages/customer/PoliciesPage';
import ClaimsPage from '../pages/customer/ClaimsPage';
import Profile from '../pages/customer/Profile';
import KYCPage from '../pages/customer/KYCPage';
import QuotePage from '../pages/customer/QuotePage';
import ProposalPage from '../pages/customer/ProposalPage';
import MyProposals from '../pages/customer/MyProposals';
import PaymentsPage from '../pages/customer/PaymentsPage';
import CoveragePage from '../pages/customer/CoveragePage';



// Role-based Dashboard
import RoleDashboard from '../components/common/RoleDashboard';

// Agent Pages
import AgentDashboard from '../pages/agent/AgentDashboard';
import CustomerList from '../pages/agent/CustomerList';
import ProposalManagement from '../pages/agent/ProposalManagement';
import ClaimAssistance from '../pages/agent/ClaimAssistance';

// Underwriter Pages
import UnderwriterDashboard from '../pages/underwriter/UnderwriterDashboard';
import PendingProposals from '../pages/underwriter/PendingProposals';
import DocumentVerification from '../pages/underwriter/DocumentVerification';
import RiskAssessment from '../pages/underwriter/RiskAssessment';
import ClaimReview from '../pages/underwriter/ClaimReview';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
// import AdminDashboardTest from '../pages/admin/AdminDashboardTest';
import UserManagement from '../pages/admin/UserManagement';
import UserProfile from '../pages/admin/UserProfile';
import ProductManagement from '../pages/admin/ProductManagement';
import PolicyManagement from '../pages/admin/PolicyManagement';
import ClaimManagement from '../pages/admin/ClaimManagement';
import SystemReports from '../pages/admin/SystemReports';

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      

      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      

      <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
      

      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><Dashboard /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><Profile /></ProtectedRoute>} />
      <Route path="/kyc" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><KYCPage /></ProtectedRoute>} />
      <Route path="/quote" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><QuotePage /></ProtectedRoute>} />
      <Route path="/proposals" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><ProposalPage /></ProtectedRoute>} />
      <Route path="/my-proposals" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><MyProposals /></ProtectedRoute>} />
      <Route path="/policies" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><PoliciesPage /></ProtectedRoute>} />
      <Route path="/claims" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><ClaimsPage /></ProtectedRoute>} />
      <Route path="/claims/:claimId" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><ClaimsPage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><PaymentsPage /></ProtectedRoute>} />
      <Route path="/coverage" element={<ProtectedRoute allowedRoles={[UserRole.Customer]}><CoveragePage /></ProtectedRoute>} />
      

      <Route path="/agent" element={<ProtectedRoute allowedRoles={[UserRole.Agent]}><AgentDashboard /></ProtectedRoute>} />
      <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.Agent]}><AgentDashboard /></ProtectedRoute>} />
      <Route path="/agent/profile" element={<ProtectedRoute allowedRoles={[UserRole.Agent]}><Profile /></ProtectedRoute>} />
      <Route path="/agent/customers" element={<ProtectedRoute allowedRoles={[UserRole.Agent]}><CustomerList /></ProtectedRoute>} />
      <Route path="/agent/customer/:userId" element={<ProtectedRoute allowedRoles={[UserRole.Agent]}><UserProfile /></ProtectedRoute>} />
      <Route path="/agent/proposals" element={<ProtectedRoute allowedRoles={[UserRole.Agent]}><ProposalManagement /></ProtectedRoute>} />
      <Route path="/agent/claims" element={<ProtectedRoute allowedRoles={[UserRole.Agent]}><ClaimAssistance /></ProtectedRoute>} />
      

      <Route path="/underwriter" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><UnderwriterDashboard /></ProtectedRoute>} />
      <Route path="/underwriter/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><UnderwriterDashboard /></ProtectedRoute>} />
      <Route path="/underwriter/profile" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><Profile /></ProtectedRoute>} />
      <Route path="/underwriter/proposals" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><PendingProposals /></ProtectedRoute>} />
      <Route path="/underwriter/documents" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><DocumentVerification /></ProtectedRoute>} />
      <Route path="/underwriter/risk" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><RiskAssessment /></ProtectedRoute>} />
      <Route path="/underwriter/claims" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><ClaimReview /></ProtectedRoute>} />
      <Route path="/underwriter/claims/:claimId" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter, UserRole.Customer]}><ClaimsPage /></ProtectedRoute>} />
      <Route path="/underwriter/customer/:userId" element={<ProtectedRoute allowedRoles={[UserRole.Underwriter]}><UserProfile /></ProtectedRoute>} />
      

      <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><Profile /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/user-profile/:userId" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><UserProfile /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><ProductManagement /></ProtectedRoute>} />
      <Route path="/admin/policies" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><PolicyManagement /></ProtectedRoute>} />
      <Route path="/admin/claims" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><ClaimManagement /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[UserRole.Admin]}><SystemReports /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
