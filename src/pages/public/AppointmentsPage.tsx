import React, { useState } from 'react';
import CalendarComponent from '../../components/CalendarComponent';
import { addItem } from '../../services/firebaseService';
import { format } from 'date-fns';

const AppointmentsPage = () => {
  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    cekim_turu: 'Düğün',
    tarih: '',
    saat: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dateTime = new Date(`${formData.tarih}T${formData.saat || '00:00'}`);
      await addItem('shoots', {
        ...formData,
        durum: 'rezervasyon',
        baslangic_tarihi: dateTime.toISOString(),
        kayit_tarihi: new Date().toISOString()
      });
      alert('Randevu talebiniz başarıyla iletildi. Sizinle en kısa sürede iletişime geçeceğiz.');
      setFormData({ ad_soyad: '', telefon: '', cekim_turu: 'Düğün', tarih: '', saat: '' });
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Randevu Takvimi</h1>
        <p className="text-slate-600 dark:text-slate-400">Müsaitlik durumumuzu inceleyebilir ve talebinizi iletebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CalendarComponent onDateClick={(date) => setFormData({ ...formData, tarih: format(date, 'yyyy-MM-dd') })} />
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold mb-4 dark:text-white">Randevu Talebi</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adınız Soyadınız</label>
                <input 
                  type="text" 
                  required
                  value={formData.ad_soyad}
                  onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Örn: Ayşe Yılmaz" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon Numaranız</label>
                <input 
                  type="tel" 
                  required
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="05xx xxx xx xx" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Çekim Türü</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  value={formData.cekim_turu}
                  onChange={(e) => setFormData({ ...formData, cekim_turu: e.target.value })}
                >
                  <option>Düğün</option>
                  <option>Nişan</option>
                  <option>Kına</option>
                  <option>Dış Çekim</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tercih Edilen Tarih</label>
                  <input 
                    type="date" 
                    required
                    value={formData.tarih}
                    onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Saat</label>
                  <input 
                    type="time" 
                    required
                    value={formData.saat}
                    onChange={(e) => setFormData({ ...formData, saat: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Talep Gönder'}
              </button>
            </form>
          </div>

          <div className="card p-6 bg-slate-50 dark:bg-slate-800 border-none">
            <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">Bilgilendirme</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Takvimdeki dolu günler kesinleşmiş rezervasyonları göstermektedir. Boş günler için talep oluşturabilirsiniz. Talebiniz incelendikten sonra sizinle iletişime geçilecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
