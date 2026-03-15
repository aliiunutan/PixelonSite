import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, Circle, AlertCircle, Camera } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';
import { format } from 'date-fns';

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [shoots, setShoots] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    gorev_adi: '',
    aciklama: '',
    durum: 'beklemede',
    son_tarih: '',
    cekim_id: ''
  });

  useEffect(() => {
    const unsubTasks = subscribeToCollection('tasks', setTasks);
    const unsubShoots = subscribeToCollection('shoots', setShoots);
    return () => {
      unsubTasks();
      unsubShoots();
    };
  }, []);

  const handleOpenModal = (task: any = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        gorev_adi: task.gorev_adi || '',
        aciklama: task.aciklama || '',
        durum: task.durum || 'beklemede',
        son_tarih: task.son_tarih || '',
        cekim_id: task.cekim_id || ''
      });
    } else {
      setEditingTask(null);
      setFormData({
        gorev_adi: '',
        aciklama: '',
        durum: 'beklemede',
        son_tarih: '',
        cekim_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateItem('tasks', editingTask.id, formData);
      } else {
        await addItem('tasks', formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('tasks', id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const toggleComplete = async (task: any) => {
    try {
      await updateItem('tasks', task.id, { durum: task.durum === 'tamamlandi' ? 'beklemede' : 'tamamlandi' });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.gorev_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Not & Görevler</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Görev ara..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Yeni Görev Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex items-start gap-4 hover:border-primary/30 dark:hover:border-primary/30 transition-colors ${task.durum === 'tamamlandi' ? 'opacity-60' : ''}`}>
            <button 
              onClick={() => toggleComplete(task)}
              className={`mt-1 transition-colors ${task.durum === 'tamamlandi' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-primary dark:hover:text-primary'}`}
            >
              {task.durum === 'tamamlandi' ? <CheckCircle size={24} /> : <Circle size={24} />}
            </button>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-bold text-slate-900 dark:text-white ${task.durum === 'tamamlandi' ? 'line-through' : ''}`}>{task.gorev_adi}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  task.durum === 'tamamlandi' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                  task.durum === 'beklemede' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {task.durum}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{task.aciklama}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                {task.cekim_id && (
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Camera size={12} />
                    {shoots.find(s => s.id === task.cekim_id)?.kisi_ad || 'Çekim'} - {shoots.find(s => s.id === task.cekim_id)?.tur_ad || ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <AlertCircle size={12} />
                  Son Tarih: {task.son_tarih || '-'}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleOpenModal(task)} className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            Görev bulunamadı.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTask ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">İlgili Çekim</label>
            <select 
              value={formData.cekim_id}
              onChange={(e) => setFormData({...formData, cekim_id: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Çekim Seçin (Opsiyonel)</option>
              {shoots.map(shoot => (
                <option key={shoot.id} value={shoot.id}>
                  {shoot.kisi_ad} - {shoot.tur_ad} ({shoot.baslangic_tarihi ? format(new Date(shoot.baslangic_tarihi), 'dd.MM.yyyy') : ''})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Başlık</label>
            <input 
              type="text" 
              required
              value={formData.gorev_adi}
              onChange={(e) => setFormData({...formData, gorev_adi: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açıklama</label>
            <textarea 
              value={formData.aciklama}
              onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Durum</label>
              <select 
                value={formData.durum}
                onChange={(e) => setFormData({...formData, durum: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="beklemede">Beklemede</option>
                <option value="tamamlandi">Tamamlandı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Son Tarih</label>
              <input 
                type="date" 
                value={formData.son_tarih}
                onChange={(e) => setFormData({...formData, son_tarih: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full btn-primary py-3">
              {editingTask ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
