import React, { useState } from 'react';
import CalendarComponent from '../../components/CalendarComponent';
import { addItem } from '../../services/firebaseService';

const AppointmentsPage = () => {
  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    cekim_turu: 'Düğün',
    tarih: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addItem('shoots', {
        ...formData,
        durum: 'rezervasyon',
        baslangic_tarihi: new Date(formData.tarih).toISOString(),
        kayit_tarihi: new Date().toISOString()
      });
      alert('Randevu talebiniz başarıyla iletildi. Sizinle en kısa sürede iletişime geçeceğiz.');
      setFormData({ ad_soyad: '', telefon: '', cekim_turu: 'Düğün', tarih: '' });
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Randevu Takvimi</h1>
        <p className="text-slate-600">Müsaitlik durumumuzu inceleyebilir ve talebinizi iletebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CalendarComponent onDateClick={(date) => setFormData({ ...formData, tarih: date.toISOString().split('T')[0] })} />
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Randevu Talebi</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adınız Soyadınız</label>
                <input 
                  type="text" 
                  required
                  value={formData.ad_soyad}
                  onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Örn: Ayşe Yılmaz" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon Numaranız</label>
                <input 
                  type="tel" 
                  required
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="05xx xxx xx xx" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Çekim Türü</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                  value={formData.cekim_turu}
                  onChange={(e) => setFormData({ ...formData, cekim_turu: e.target.value })}
                >
                  <option>Düğün</option>
                  <option>Nişan</option>
                  <option>Kına</option>
                  <option>Dış Çekim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tercih Edilen Tarih</label>
                <input 
                  type="date" 
                  required
                  value={formData.tarih}
                  onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none" 
                />
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

          <div className="card p-6 bg-slate-50 border-none">
            <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-slate-400">Bilgilendirme</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Takvimdeki dolu günler kesinleşmiş rezervasyonları göstermektedir. Boş günler için talep oluşturabilirsiniz. Talebiniz incelendikten sonra sizinle iletişime geçilecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
