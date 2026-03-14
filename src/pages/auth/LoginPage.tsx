import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mail, Lock, Github, Chrome, Instagram, Facebook, ArrowLeft } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../../firebase';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/admin');
    } catch (error) {
      console.error('Google login error:', error);
      alert('Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Email login logic could be added here
    alert('E-posta ile giriş şu an aktif değil, lütfen Google ile giriş yapın.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Web Sitesine Dön
      </Link>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Camera className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold tracking-tight">Pixelon Medya</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin ? 'Devam etmek için giriş yapın' : 'Hemen kayıt olun ve başlayın'}
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Giriş Yap
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Kayıt Ol
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Adınız Soyadınız" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="email" required className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="ornek@mail.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="password" required className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-primary/20">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">Veya şununla devam et</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex justify-center items-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Chrome className="w-5 h-5 text-red-500" />
          </button>
          <button className="flex justify-center items-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Instagram className="w-5 h-5 text-pink-600" />
          </button>
          <button className="flex justify-center items-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Facebook className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Giriş yaparak kullanım koşullarımızı ve gizlilik politikamızı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
