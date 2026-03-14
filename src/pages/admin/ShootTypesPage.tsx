import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Camera as CameraIcon } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';

const ShootTypesPage = () => {
  const [shootTypes, setShootTypes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    ad: '',
    aciklama: ''
  });

  useEffect(() => {
    const unsub = subscribeToCollection('shoot_types', setShootTypes);
    return () => unsub();
  }, []);

  const handleOpenModal = (type: any = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        ad: type.ad || '',
        aciklama: type.aciklama || ''
      });
    } else {
      setEditingType(null);
      setFormData({
        ad: '',
        aciklama: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await updateItem('shoot_types', editingType.id, formData);
      } else {
        await addItem('shoot_types', formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving shoot type:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu çekim türünü silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('shoot_types', id);
      } catch (error) {
        console.error('Error deleting shoot type:', error);
      }
    }
  };

  const filteredTypes = shootTypes.filter(t => 
    t.ad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Çekim Türleri</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tür ara..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Yeni Tür Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map((type) => (
          <div key={type.id} className="card p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <CameraIcon size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(type)} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(type.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{type.ad}</h3>
            <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">
              {type.aciklama || 'Açıklama belirtilmemiş.'}
            </p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">ID: #{type.id.slice(0, 8)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingType ? 'Tür Düzenle' : 'Yeni Tür Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tür Adı</label>
            <input 
              type="text" 
              required
              value={formData.ad}
              onChange={(e) => setFormData({...formData, ad: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Örn: Düğün, Nişan, Dış Çekim"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
            <textarea 
              value={formData.aciklama}
              onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
              placeholder="Tür hakkında kısa bilgi..."
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3">
              {editingType ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShootTypesPage;
