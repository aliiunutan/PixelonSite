import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';

const PeoplePage = () => {
  const [people, setPeople] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    sifre: '',
    tip: 'musteri',
    firma_id: ''
  });

  useEffect(() => {
    const unsubPeople = subscribeToCollection('people', setPeople);
    const unsubCompanies = subscribeToCollection('companies', setCompanies);
    return () => {
      unsubPeople();
      unsubCompanies();
    };
  }, []);

  const handleOpenModal = (person: any = null) => {
    if (person) {
      setEditingPerson(person);
      setFormData({
        ad: person.ad || '',
        soyad: person.soyad || '',
        email: person.email || '',
        telefon: person.telefon || '',
        sifre: person.sifre || '',
        tip: person.tip || 'musteri',
        firma_id: person.firma_id || ''
      });
    } else {
      setEditingPerson(null);
      setFormData({
        ad: '',
        soyad: '',
        email: '',
        telefon: '',
        sifre: '',
        tip: 'musteri',
        firma_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPerson) {
        await updateItem('people', editingPerson.id, formData);
      } else {
        await addItem('people', formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kişiyi silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('people', id);
      } catch (error) {
        console.error('Error deleting person:', error);
      }
    }
  };

  const filteredPeople = people.filter(p => 
    `${p.ad} ${p.soyad}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefon?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Kişi Yönetimi</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Yeni Kişi Ekle
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim, e-posta veya telefon ile ara..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Ad Soyad</th>
                <th className="px-6 py-4 font-bold">İletişim</th>
                <th className="px-6 py-4 font-bold">Tip</th>
                <th className="px-6 py-4 font-bold">Firma</th>
                <th className="px-6 py-4 font-bold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPeople.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{person.ad} {person.soyad}</div>
                    <div className="text-xs text-slate-500">ID: #{person.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{person.email || '-'}</div>
                    <div className="text-xs text-slate-500">{person.telefon || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      person.tip === 'yonetici' ? 'bg-indigo-100 text-indigo-700' :
                      person.tip === 'firma_yetkilisi' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {person.tip === 'yonetici' ? 'Yönetici' : person.tip === 'firma_yetkilisi' ? 'Firma Yetkilisi' : 'Müşteri'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {companies.find(c => c.id === person.firma_id)?.firma_adi || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(person)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(person.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPerson ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
              <input 
                type="text" 
                required
                value={formData.ad}
                onChange={(e) => setFormData({...formData, ad: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Soyad</label>
              <input 
                type="text" 
                required
                value={formData.soyad}
                onChange={(e) => setFormData({...formData, soyad: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
            <input 
              type="tel" 
              value={formData.telefon}
              onChange={(e) => setFormData({...formData, telefon: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <input 
              type="password" 
              value={formData.sifre}
              onChange={(e) => setFormData({...formData, sifre: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Giriş şifresi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tip</label>
            <select 
              value={formData.tip}
              onChange={(e) => setFormData({...formData, tip: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="musteri">Müşteri</option>
              <option value="firma_yetkilisi">Firma Yetkilisi</option>
              <option value="yonetici">Yönetici</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Firma</label>
            <select 
              value={formData.firma_id}
              onChange={(e) => setFormData({...formData, firma_id: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Firma Seçin (Opsiyonel)</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.firma_adi}</option>
              ))}
            </select>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3">
              {editingPerson ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PeoplePage;
