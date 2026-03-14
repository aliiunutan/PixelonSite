import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package as PackageIcon } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';

const PackagesPage = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    paket_adi: '',
    paket_fiyati: 0,
    icerik: ''
  });

  useEffect(() => {
    const unsub = subscribeToCollection('packages', setPackages);
    return () => unsub();
  }, []);

  const handleOpenModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        paket_adi: pkg.paket_adi || '',
        paket_fiyati: pkg.paket_fiyati || 0,
        icerik: pkg.icerik || ''
      });
    } else {
      setEditingPackage(null);
      setFormData({
        paket_adi: '',
        paket_fiyati: 0,
        icerik: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        paket_fiyati: Number(formData.paket_fiyati)
      };
      if (editingPackage) {
        await updateItem('packages', editingPackage.id, data);
      } else {
        await addItem('packages', data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu paketi silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('packages', id);
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const filteredPackages = packages.filter(p => 
    p.paket_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Paket Yönetimi</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Paket ara..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Yeni Paket Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="card p-8 flex flex-col justify-between border-t-4 border-t-primary">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <PackageIcon size={28} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(pkg)} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{pkg.paket_adi}</h3>
              <div className="text-3xl font-extrabold text-primary mb-6">₺{pkg.paket_fiyati.toLocaleString('tr-TR')}</div>
              <div className="space-y-3 mb-8">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Paket İçeriği</p>
                <ul className="space-y-2">
                  {pkg.icerik?.split('\n').map((line: string, i: number) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">ID: #{pkg.id.slice(0, 8)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPackage ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paket Adı</label>
            <input 
              type="text" 
              required
              value={formData.paket_adi}
              onChange={(e) => setFormData({...formData, paket_adi: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fiyat (₺)</label>
            <input 
              type="number" 
              required
              value={formData.paket_fiyati}
              onChange={(e) => setFormData({...formData, paket_fiyati: Number(e.target.value)})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">İçerik (Her satıra bir özellik)</label>
            <textarea 
              required
              value={formData.icerik}
              onChange={(e) => setFormData({...formData, icerik: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary h-48 resize-none"
              placeholder="Örn: 10 Adet Baskı&#10;Tüm Dijital Teslimat&#10;1 Saat Çekim"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3">
              {editingPackage ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PackagesPage;
