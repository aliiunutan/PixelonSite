import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    firma_adi: '',
    adres: '',
    telefon: '',
    notlar: ''
  });

  useEffect(() => {
    const unsub = subscribeToCollection('companies', setCompanies);
    return () => unsub();
  }, []);

  const handleOpenModal = (company: any = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        firma_adi: company.firma_adi || '',
        adres: company.adres || '',
        telefon: company.telefon || '',
        notlar: company.notlar || ''
      });
    } else {
      setEditingCompany(null);
      setFormData({
        firma_adi: '',
        adres: '',
        telefon: '',
        notlar: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateItem('companies', editingCompany.id, formData);
      } else {
        await addItem('companies', formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu firmayı silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('companies', id);
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.firma_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Firma Yönetimi</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Firma ara..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Yeni Firma Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl">
                  {company.firma_adi[0]}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(company)} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(company.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{company.firma_adi}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} />
                  {company.adres || 'Adres belirtilmemiş'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={14} />
                  {company.telefon || 'Telefon belirtilmemiş'}
                </div>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 italic">
                {company.notlar || 'Not bulunmuyor.'}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">ID: #{company.id.slice(0, 8)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCompany ? 'Firmayı Düzenle' : 'Yeni Firma Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Firma Adı</label>
            <input 
              type="text" 
              required
              value={formData.firma_adi}
              onChange={(e) => setFormData({...formData, firma_adi: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
            <textarea 
              value={formData.adres}
              onChange={(e) => setFormData({...formData, adres: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
            <textarea 
              value={formData.notlar}
              onChange={(e) => setFormData({...formData, notlar: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3">
              {editingCompany ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
