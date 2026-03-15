import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, DollarSign, FileText, CheckCircle, Clock, Building2 } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';
import { format } from 'date-fns';

const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    cekim_id: '',
    kisi_id: '',
    firma_id: '',
    toplam_tutar: '',
    kapora: '0',
    odeme_tarihi: format(new Date(), 'yyyy-MM-dd'),
    odeme_durumu: 'beklemede',
    notlar: ''
  });

  const [shoots, setShoots] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    const unsubPayments = subscribeToCollection('payments', setPayments);
    const unsubCompanies = subscribeToCollection('companies', setCompanies);
    const unsubShoots = subscribeToCollection('shoots', setShoots);
    const unsubPeople = subscribeToCollection('people', setPeople);
    return () => {
      unsubPayments();
      unsubCompanies();
      unsubShoots();
      unsubPeople();
    };
  }, []);

  const handleOpenModal = (payment: any = null) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        cekim_id: payment.cekim_id || '',
        kisi_id: payment.kisi_id || '',
        firma_id: payment.firma_id || '',
        toplam_tutar: payment.toplam_tutar?.toString() || '',
        kapora: payment.kapora?.toString() || '0',
        odeme_tarihi: payment.odeme_tarihi || format(new Date(), 'yyyy-MM-dd'),
        odeme_durumu: payment.odeme_durumu || 'beklemede',
        notlar: payment.notlar || ''
      });
    } else {
      setEditingPayment(null);
      setFormData({
        cekim_id: '',
        kisi_id: '',
        firma_id: '',
        toplam_tutar: '',
        kapora: '0',
        odeme_tarihi: format(new Date(), 'yyyy-MM-dd'),
        odeme_durumu: 'beklemede',
        notlar: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const company = companies.find(c => c.id === formData.firma_id);
      const data = {
        ...formData,
        firma_adi: company ? company.firma_adi : 'Bilinmeyen Firma',
        toplam_tutar: parseFloat(formData.toplam_tutar),
        kapora: parseFloat(formData.kapora),
        kayit_tarihi: editingPayment ? editingPayment.kayit_tarihi : new Date().toISOString()
      };

      if (editingPayment) {
        await updateItem('payments', editingPayment.id, data);
      } else {
        await addItem('payments', data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ödeme kaydını silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('payments', id);
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const filteredPayments = payments.filter(p => 
    p.firma_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.fatura_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceived = payments.reduce((acc, p) => acc + (p.odeme_durumu === 'tamamlandi' ? p.toplam_tutar : p.kapora || 0), 0);
  const totalPending = payments.reduce((acc, p) => acc + (p.odeme_durumu !== 'tamamlandi' ? (p.toplam_tutar - (p.kapora || 0)) : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ödeme & Fatura</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Firma veya fatura no ara..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Yeni Fatura Oluştur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Toplam Tahsilat</p>
          <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">₺{totalReceived.toLocaleString('tr-TR')}</h3>
        </div>
        <div className="card p-6 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Bekleyen Ödemeler</p>
          <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-300">₺{totalPending.toLocaleString('tr-TR')}</h3>
        </div>
      </div>

      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Fatura No</th>
                <th className="px-6 py-4 font-bold">Firma</th>
                <th className="px-6 py-4 font-bold">Tutar</th>
                <th className="px-6 py-4 font-bold">Durum</th>
                <th className="px-6 py-4 font-bold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400 dark:text-slate-500" />
                      <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{payment.fatura_no || `INV-${payment.id.substring(0, 6)}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400 dark:text-slate-500" />
                      <div className="font-semibold text-slate-900 dark:text-white">{payment.firma_adi}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">₺{payment.toplam_tutar.toLocaleString('tr-TR')}</div>
                    {payment.kapora > 0 && <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Kapora: ₺{payment.kapora}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                      payment.odeme_durumu === 'tamamlandi' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                      payment.odeme_durumu === 'kismi_odendi' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {payment.odeme_durumu === 'tamamlandi' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {payment.odeme_durumu === 'tamamlandi' ? 'Tamamlandı' : payment.odeme_durumu === 'kismi_odendi' ? 'Kısmi Ödendi' : 'Beklemede'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(payment)} className="p-2 text-slate-400 hover:text-primary dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(payment.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    Ödeme kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPayment ? 'Faturayı Düzenle' : 'Yeni Fatura Oluştur'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">İlgili Çekim</label>
            <select 
              required
              value={formData.cekim_id}
              onChange={(e) => setFormData({...formData, cekim_id: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Çekim Seçin</option>
              {shoots.map(shoot => (
                <option key={shoot.id} value={shoot.id}>{shoot.kisi_ad} - {shoot.tur_ad} ({format(new Date(shoot.baslangic_tarihi), 'dd.MM.yyyy')})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Firma</label>
              <select 
                required
                value={formData.firma_id}
                onChange={(e) => setFormData({...formData, firma_id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Firma Seçin</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.firma_adi}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Müşteri</label>
              <select 
                value={formData.kisi_id}
                onChange={(e) => setFormData({...formData, kisi_id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Müşteri Seçin (Opsiyonel)</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>{person.ad} {person.soyad}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Toplam Tutar (TL)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.toplam_tutar}
                onChange={(e) => setFormData({...formData, toplam_tutar: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kapora (TL)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.kapora}
                onChange={(e) => setFormData({...formData, kapora: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ödeme Tarihi</label>
              <input 
                type="date" 
                value={formData.odeme_tarihi}
                onChange={(e) => setFormData({...formData, odeme_tarihi: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ödeme Durumu</label>
              <select 
                value={formData.odeme_durumu}
                onChange={(e) => setFormData({...formData, odeme_durumu: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="beklemede">Beklemede</option>
                <option value="kismi_odendi">Kısmi Ödendi</option>
                <option value="tamamlandi">Tamamlandı</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notlar</label>
            <textarea 
              value={formData.notlar}
              onChange={(e) => setFormData({...formData, notlar: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3">
              {editingPayment ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
