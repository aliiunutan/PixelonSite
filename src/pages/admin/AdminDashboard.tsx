import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Calendar as CalendarIcon, Camera, Scissors, 
  ArrowUpRight, ArrowDownRight, MoreVertical, DollarSign, ExternalLink 
} from 'lucide-react';
import CalendarComponent from '../../components/CalendarComponent';
import { useNavigate, Link } from 'react-router-dom';
import { subscribeToCollection } from '../../services/firebaseService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [shoots, setShoots] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const unsubShoots = subscribeToCollection('shoots', setShoots);
    const unsubPayments = subscribeToCollection('payments', setPayments);
    const unsubTasks = subscribeToCollection('tasks', setTasks);
    return () => {
      unsubShoots();
      unsubPayments();
      unsubTasks();
    };
  }, []);

  const totalEarnings = payments.reduce((acc, curr) => acc + (curr.toplam_tutar || 0), 0);
  const expectedEarnings = payments.filter(p => p.odeme_durumu !== 'tamamlandi').reduce((acc, curr) => acc + (curr.toplam_tutar || 0), 0);
  const pendingShoots = shoots.filter(s => s.durum === 'rezervasyon').length;
  const pendingEdits = shoots.filter(s => s.durum === 'montaj').length;

  const stats = [
    { label: 'Toplam Kazanç', value: `₺${totalEarnings.toLocaleString()}`, trend: '+12%', isUp: true, color: 'emerald' },
    { label: 'Beklenen Kazanç', value: `₺${expectedEarnings.toLocaleString()}`, trend: '+5%', isUp: true, color: 'amber' },
    { label: 'Beklenen Çekimler', value: pendingShoots.toString(), trend: '-2', isUp: false, color: 'indigo' },
    { label: 'Beklenen Montajlar', value: pendingEdits.toString(), trend: '+1', isUp: true, color: 'rose' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 text-sm">İşletmenizin genel durumuna göz atın.</p>
        </div>
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm font-medium"
        >
          <ExternalLink size={18} />
          Web Sitesine Git
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`} style={{ backgroundColor: `var(--theme-${stat.color})15`, color: `var(--theme-${stat.color})` }}>
                {i === 0 ? <TrendingUp size={20} /> : i === 1 ? <DollarSign size={20} /> : i === 2 ? <Camera size={20} /> : <Scissors size={20} />}
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical size={16} />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <span className={`text-xs font-bold flex items-center ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">İş Takvimi</h2>
          <button onClick={() => navigate('/admin/cekimler', { state: { openModal: true } })} className="btn-primary text-sm">Yeni Çekim Ekle</button>
        </div>
        <CalendarComponent isAdmin />
      </div>

      {/* Recent Activity / Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold">Yaklaşan Çekimler</h3>
            <Link to="/admin/cekimler" className="text-xs text-primary font-semibold">Tümünü Gör</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {shoots.length > 0 ? shoots.slice(0, 5).map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Camera size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.kisi_ad || 'Müşteri'}</p>
                    <p className="text-xs text-slate-500">{item.tur_ad || 'Çekim'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-900">
                    {item.baslangic_tarihi ? new Date(item.baslangic_tarihi).toLocaleDateString('tr-TR') : '-'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.baslangic_tarihi ? new Date(item.baslangic_tarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-8">Yaklaşan çekim bulunmuyor.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold">Görevler & Notlar</h3>
            <Link to="/admin/gorevler" className="text-xs text-primary font-semibold">Tümünü Gör</Link>
          </div>
          <div className="p-6 space-y-4">
            {tasks.length > 0 ? tasks.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={item.durum === 'tamamlandi'}
                  readOnly
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary" 
                />
                <div className="flex-grow">
                  <p className="text-sm text-slate-700">{item.gorev_adi}</p>
                  <span className={`text-[10px] font-bold uppercase ${item.durum === 'tamamlandi' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {item.durum === 'tamamlandi' ? 'Tamamlandı' : 'Beklemede'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">Henüz görev bulunmuyor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
