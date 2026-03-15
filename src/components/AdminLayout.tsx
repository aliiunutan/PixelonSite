import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Camera, Calendar, 
  Package, TurkishLira, MessageSquare, ClipboardList, 
  ChevronDown, LogOut, Menu, X, Palette, Settings, ExternalLink, Moon, Sun,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFirebase } from '../context/FirebaseContext';
import { auth, signOut } from '../firebase';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { setThemeColor, isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useFirebase();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'people', label: 'Kişi Yönetimi', icon: Users, path: '/admin/kisiler' },
    { id: 'companies', label: 'Firma Yönetimi', icon: Building2, path: '/admin/firmalar' },
    { id: 'shoot-types', label: 'Çekim Türleri', icon: Camera, path: '/admin/cekim-turleri' },
    { id: 'calendar', label: 'Çekim & Takvim', icon: Calendar, path: '/admin/cekimler' },
    { 
      id: 'packages', label: 'Paket Yönetimi', icon: Package,
      children: [
        { label: 'Paket Listesi', path: '/admin/paketler' },
        { label: 'Firma Paket Fiyatları', path: '/admin/paketler/fiyatlar' }
      ]
    },
    { id: 'reviews', label: 'Müşteri Yorumları', icon: MessageSquare, path: '/admin/yorumlar' },
    { id: 'tasks', label: 'Not & Görevler', icon: ClipboardList, path: '/admin/gorevler' },
    { id: 'payments', label: 'Ödeme & Fatura', icon: TurkishLira, path: '/admin/odemeler' },
    { id: 'reports', label: 'Raporlar & Grafikler', icon: BarChart3, path: '/admin/raporlar' },
    { id: 'website', label: 'Web Sitesine Git', icon: ExternalLink, path: '/', external: true },
  ];

  const themeOptions = [
    { color: 'indigo', name: 'İndigo' },
    { color: 'emerald', name: 'Zümrüt' },
    { color: 'rose', name: 'Gül' },
    { color: 'amber', name: 'Kehribar' },
    { color: 'slate', name: 'Arduvaz' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center gap-2 truncate">
              <img 
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=128&h=128&fit=crop" 
                alt="Logo" 
                className="w-8 h-8 rounded-md object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-lg">Pixelon Admin</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item) => (
            <div key={item.id} className="px-2 mb-1">
              {item.children ? (
                <div>
                  <button 
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="text-slate-400" />
                      {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {isSidebarOpen && <ChevronDown size={16} className={`transition-transform ${openMenus[item.id] ? 'rotate-180' : ''}`} />}
                  </button>
                  {isSidebarOpen && openMenus[item.id] && (
                    <div className="mt-1 ml-9 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block p-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg ${location.pathname === child.path ? 'text-white bg-slate-800' : ''}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path!}
                  target={item.external ? "_blank" : undefined}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors ${location.pathname === item.path && !item.external ? 'bg-primary text-white' : 'text-slate-400'} ${!isSidebarOpen && 'justify-center'}`}
                >
                  <item.icon size={20} />
                  {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="group relative">
            <button className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
              <Palette size={20} className="text-slate-400" />
              {isSidebarOpen && <span className="text-sm font-medium">Tema Değiştir</span>}
            </button>
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
              {themeOptions.map((opt) => (
                <button
                  key={opt.color}
                  onClick={() => setThemeColor(opt.color as any)}
                  className="w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-700 flex items-center gap-2"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `var(--theme-${opt.color})` }} />
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-2 mt-2 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 transition-colors duration-200">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
            {menuItems.find(m => m.path === location.pathname || m.children?.some(c => c.path === location.pathname))?.label || 'Admin Paneli'}
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              title={isDarkMode ? "Açık Tema" : "Koyu Tema"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.displayName || user?.email?.split('@')[0] || 'Yönetici'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Yönetici</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
              {(user?.displayName || user?.email || 'Y').charAt(0)}
            </div>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
