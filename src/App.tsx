import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FirebaseProvider } from './context/FirebaseContext';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AppointmentsPage from './pages/public/AppointmentsPage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ReviewsPage from './pages/public/ReviewsPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PeoplePage from './pages/admin/PeoplePage';
import CompaniesPage from './pages/admin/CompaniesPage';
import ShootTypesPage from './pages/admin/ShootTypesPage';
import ShootsPage from './pages/admin/ShootsPage';
import TasksPage from './pages/admin/TasksPage';
import ReviewsAdminPage from './pages/admin/ReviewsAdminPage';
import PackagesPage from './pages/admin/PackagesPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import FirmPricingPage from './pages/admin/FirmPricingPage';
import ReportsPage from './pages/admin/ReportsPage';
import CalendarComponent from './components/CalendarComponent';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-slate-400 font-medium italic">
    {title} sayfası yakında eklenecek...
  </div>
);

export default function App() {
  return (
    <FirebaseProvider>
      <ThemeProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/hakkimizda" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/hizmetler" element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path="/randevular" element={<PublicLayout><AppointmentsPage /></PublicLayout>} />
          <Route path="/yorumlar" element={<PublicLayout><ReviewsPage /></PublicLayout>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/kisiler" element={<AdminLayout><PeoplePage /></AdminLayout>} />
          <Route path="/admin/kisiler/yeni" element={<AdminLayout><PeoplePage /></AdminLayout>} />
          <Route path="/admin/firmalar" element={<AdminLayout><CompaniesPage /></AdminLayout>} />
          <Route path="/admin/firmalar/yeni" element={<AdminLayout><CompaniesPage /></AdminLayout>} />
          <Route path="/admin/cekim-turleri" element={<AdminLayout><ShootTypesPage /></AdminLayout>} />
          <Route path="/admin/takvim" element={<AdminLayout><div className="space-y-4"><h2 className="text-xl font-bold">İş Takvimi</h2><CalendarComponent isAdmin /></div></AdminLayout>} />
          <Route path="/admin/cekimler" element={<AdminLayout><ShootsPage /></AdminLayout>} />
          <Route path="/admin/cekimler/yeni" element={<AdminLayout><ShootsPage /></AdminLayout>} />
          <Route path="/admin/paketler" element={<AdminLayout><PackagesPage /></AdminLayout>} />
          <Route path="/admin/paketler/fiyatlar" element={<AdminLayout><FirmPricingPage /></AdminLayout>} />
          <Route path="/admin/yorumlar" element={<AdminLayout><ReviewsAdminPage /></AdminLayout>} />
          <Route path="/admin/gorevler" element={<AdminLayout><TasksPage /></AdminLayout>} />
          <Route path="/admin/odemeler" element={<AdminLayout><PaymentsPage /></AdminLayout>} />
          <Route path="/admin/raporlar" element={<AdminLayout><ReportsPage /></AdminLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
    </FirebaseProvider>
  );
}
