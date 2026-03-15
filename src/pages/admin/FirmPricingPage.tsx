import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, Package, DollarSign } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';

const FirmPricingPage = () => {
  const [firmPricing, setFirmPricing] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    firma_id: '',
    paket_id: '',
    ozel_fiyat: ''
  });

  useEffect(() => {
    const unsubPricing = subscribeToCollection('firm_pricing', setFirmPricing);
    const unsubCompanies = subscribeToCollection('companies', setCompanies);
    const unsubPackages = subscribeToCollection('packages', setPackages);
    return () => {
      unsubPricing();
      unsubCompanies();
      unsubPackages();
    };
  }, []);

  const handleOpenModal = (pricing: any = null) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        firma_id: pricing.firma_id || '',
        paket_id: pricing.paket_id || '',
        ozel_fiyat: pricing.ozel_fiyat || ''
      });
    } else {
      setEditingPricing(null);
      setFormData({
        firma_id: '',
        paket_id: '',
        ozel_fiyat: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const company = companies.find(c => c.id === formData.firma_id);
      const pkg = packages.find(p => p.id === formData.paket_id);
      
      const data = {
        ...formData,
        ozel_fiyat: parseFloat(formData.ozel_fiyat),
        firma_ad: company ? company.firma_adi : 'Bilinmeyen Firma',
        paket_ad: pkg ? pkg.paket_adi : 'Bilinmeyen Paket'
      };

      if (editingPricing) {
        await updateItem('firm_pricing', editingPricing.id, data);
      } else {
        await addItem('firm_pricing', data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving firm pricing:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu özel fiyatlandırmayı silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('firm_pricing', id);
      } catch (error) {
        console.error('Error deleting firm pricing:', error);
      }
    }
  };

  const filteredPricing = firmPricing.filter(p => 
    p.firma_ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.paket_ad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Firma Paket Fiyatları</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Yeni Özel Fiyat Ekle
        </button>
      </div>

      <div className="card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Firma veya paket ara..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Firma</th>
                <th className="px-6 py-4 font-bold">Paket</th>
                <th className="px-6 py-4 font-bold">Özel Fiyat</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPricing.map((pricing) => (
                <tr key={pricing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400 dark:text-slate-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pricing.firma_ad}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-slate-400 dark:text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{pricing.paket_ad}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-500 dark:text-emerald-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{pricing.ozel_fiyat} ₺</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(pricing)} className="p-2 text-slate-400 hover:text-primary dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(pricing.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPricing.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 italic">
                    Henüz özel fiyatlandırma bulunmuyor.
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
        title={editingPricing ? 'Özel Fiyatı Düzenle' : 'Yeni Özel Fiyat Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paket</label>
            <select 
              required
              value={formData.paket_id}
              onChange={(e) => setFormData({...formData, paket_id: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Paket Seçin</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.paket_adi}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Özel Fiyat (₺)</label>
            <input 
              type="number" 
              required
              value={formData.ozel_fiyat}
              onChange={(e) => setFormData({...formData, ozel_fiyat: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3">
              {editingPricing ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FirmPricingPage;
