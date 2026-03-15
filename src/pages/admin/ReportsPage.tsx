import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { subscribeToCollection } from '../../services/firebaseService';
import { format, parseISO, getYear, getMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ReportsPage = () => {
  const [shoots, setShoots] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    const unsubShoots = subscribeToCollection('shoots', setShoots);
    const unsubCompanies = subscribeToCollection('companies', setCompanies);
    const unsubPackages = subscribeToCollection('packages', setPackages);
    const unsubPayments = subscribeToCollection('payments', setPayments);
    
    return () => {
      unsubShoots();
      unsubCompanies();
      unsubPackages();
      unsubPayments();
    };
  }, []);

  // Extract unique years from shoots
  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    shoots.forEach(shoot => {
      if (shoot.baslangic_tarihi) {
        uniqueYears.add(getYear(parseISO(shoot.baslangic_tarihi)));
      }
    });
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [shoots]);

  const months = [
    { value: 0, label: 'Ocak' }, { value: 1, label: 'Şubat' }, { value: 2, label: 'Mart' },
    { value: 3, label: 'Nisan' }, { value: 4, label: 'Mayıs' }, { value: 5, label: 'Haziran' },
    { value: 6, label: 'Temmuz' }, { value: 7, label: 'Ağustos' }, { value: 8, label: 'Eylül' },
    { value: 9, label: 'Ekim' }, { value: 10, label: 'Kasım' }, { value: 11, label: 'Aralık' }
  ];

  // Filter shoots based on selected year and month
  const filteredShoots = useMemo(() => {
    return shoots.filter(shoot => {
      if (!shoot.baslangic_tarihi) return false;
      const date = parseISO(shoot.baslangic_tarihi);
      const yearMatch = selectedYear === 'all' || getYear(date).toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || getMonth(date).toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [shoots, selectedYear, selectedMonth]);

  // 1. Firma bazlı yapılan toplam çekim sayısı ve kazanç
  const companyStats = useMemo(() => {
    const stats: Record<string, { name: string; count: number; revenue: number }> = {};
    
    filteredShoots.forEach(shoot => {
      const company = companies.find(c => c.id === shoot.firma_id);
      const companyName = company ? company.firma_adi : 'Bilinmeyen Firma';
      
      if (!stats[companyName]) {
        stats[companyName] = { name: companyName, count: 0, revenue: 0 };
      }
      
      stats[companyName].count += 1;
      
      const payment = payments.find(p => p.cekim_id === shoot.id);
      if (payment) {
        stats[companyName].revenue += Number(payment.toplam_tutar) || 0;
      }
    });
    
    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [filteredShoots, companies, payments]);

  // 2. Yıllara/Aylara göre yapılan toplam çekim sayısı ve kazanç
  const timeStats = useMemo(() => {
    const stats: Record<string, { name: string; count: number; revenue: number }> = {};
    
    filteredShoots.forEach(shoot => {
      if (!shoot.baslangic_tarihi) return;
      const date = parseISO(shoot.baslangic_tarihi);
      
      let key = '';
      if (selectedYear === 'all') {
        key = getYear(date).toString();
      } else {
        key = format(date, 'MMM', { locale: tr });
      }
      
      if (!stats[key]) {
        stats[key] = { name: key, count: 0, revenue: 0 };
      }
      
      stats[key].count += 1;
      
      const payment = payments.find(p => p.cekim_id === shoot.id);
      if (payment) {
        stats[key].revenue += Number(payment.toplam_tutar) || 0;
      }
    });

    // Sort by chronological order if it's months, or numerical if years
    if (selectedYear === 'all') {
      return Object.values(stats).sort((a, b) => parseInt(a.name) - parseInt(b.name));
    } else {
      const monthOrder = months.map(m => m.label.substring(0, 3));
      return Object.values(stats).sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
    }
  }, [filteredShoots, payments, selectedYear]);

  // 3. En çok tercih edilen paketler
  const packageStats = useMemo(() => {
    const stats: Record<string, { name: string; value: number }> = {};
    
    filteredShoots.forEach(shoot => {
      if (!shoot.paket_id) return;
      
      const pkg = packages.find(p => p.id === shoot.paket_id);
      const pkgName = pkg ? pkg.paket_adi : 'Bilinmeyen Paket';
      
      if (!stats[pkgName]) {
        stats[pkgName] = { name: pkgName, value: 0 };
      }
      
      stats[pkgName].value += 1;
    });
    
    return Object.values(stats).sort((a, b) => b.value - a.value);
  }, [filteredShoots, packages]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name === 'revenue' ? 'Kazanç' : entry.name === 'count' ? 'Çekim Sayısı' : entry.name}: 
              {entry.name === 'revenue' ? ` ₺${entry.value.toLocaleString('tr-TR')}` : ` ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Raporlar & Grafikler</h2>
        
        <div className="flex flex-wrap gap-4">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tüm Yıllar</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={selectedYear === 'all'}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="all">Tüm Aylar</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firma Bazlı Kazanç */}
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Firma Bazlı Kazanç</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis yAxisId="left" orientation="left" stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Kazanç (₺)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Firma Bazlı Çekim Sayısı */}
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Firma Bazlı Çekim Sayısı</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Çekim Sayısı" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zaman Bazlı Kazanç ve Çekim */}
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            {selectedYear === 'all' ? 'Yıllara Göre Kazanç ve Çekim Sayısı' : 'Aylara Göre Kazanç ve Çekim Sayısı'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#0ea5e9" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Kazanç (₺)" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Çekim Sayısı" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* En Çok Tercih Edilen Paketler */}
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">En Çok Tercih Edilen Paketler</h3>
          <div className="h-80 flex items-center justify-center">
            {packageStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {packageStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 dark:text-slate-400">Bu dönem için paket verisi bulunamadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
