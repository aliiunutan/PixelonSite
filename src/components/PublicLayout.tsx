import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, User, LogIn, Menu, X, Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFirebase } from '../context/FirebaseContext';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { setThemeColor, isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const { user } = useFirebase();

  const navItems = [
    { name: 'Anasayfa', path: '/' },
    { name: 'Hakkımızda', path: '/hakkimizda' },
    { name: 'Hizmetler', path: '/hizmetler' },
    { name: 'Randevular', path: '/randevular' },
    { name: 'Yorumlar', path: '/yorumlar' },
  ];

  const themeOptions: { color: any, name: string }[] = [
    { color: 'indigo', name: 'İndigo' },
    { color: 'emerald', name: 'Zümrüt' },
    { color: 'rose', name: 'Gül' },
    { color: 'amber', name: 'Kehribar' },
    { color: 'slate', name: 'Arduvaz' },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=128&h=128&fit=crop" 
                alt="Pixelon Medya Logo" 
                className="w-10 h-10 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-bold tracking-tight dark:text-white">Pixelon Medya</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.path ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                title={isDarkMode ? "Açık Tema" : "Koyu Tema"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="group relative">
                <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                  <Palette className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 px-2">Tema Rengi</p>
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.color}
                      onClick={() => setThemeColor(opt.color)}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <div className={`w-3 h-3 rounded-full bg-${opt.color}-500`} style={{ backgroundColor: `var(--theme-${opt.color})` }} />
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
              {user ? (
                <Link to="/admin" className="btn-primary flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  {user.displayName || user.email?.split('@')[0] || 'Panel'}
                </Link>
              ) : (
                <Link to="/login" className="btn-primary flex items-center gap-2 text-sm">
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium dark:text-slate-300">Koyu Tema</span>
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-medium text-slate-600 dark:text-slate-300"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {user ? (
                <Link to="/admin" className="btn-primary text-center flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  {user.displayName || user.email?.split('@')[0] || 'Panel'}
                </Link>
              ) : (
                <Link to="/login" className="btn-primary text-center">Giriş Yap</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=128&h=128&fit=crop" 
                  alt="Pixelon Medya Logo" 
                  className="w-8 h-8 rounded-md object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-lg font-bold">Pixelon Medya</span>
              </div>
              <p className="text-slate-400 text-sm">
                Düğün, nişan ve tüm özel anlarınızda profesyonel fotoğraf ve video çözümleri.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hızlı Erişim</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/hizmetler">Hizmetlerimiz</Link></li>
                <li><Link to="/randevular">Randevu Al</Link></li>
                <li><Link to="/hakkimizda">Hakkımızda</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">İletişim</h3>
              <p className="text-sm text-slate-400">
                E-posta: info@pixelonmedya.com<br />
                Telefon: +90 (555) 000 00 00
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © 2026 Pixelon Medya. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
