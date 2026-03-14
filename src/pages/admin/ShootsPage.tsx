import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar as CalendarIcon, Clock, User, Tag, ChevronLeft, ChevronRight, List, MapPin } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';

const ShootsPage = () => {
  const location = useLocation();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [shoots, setShoots] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [shootTypes, setShootTypes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShoot, setEditingShoot] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState({
    kisi_id: '',
    firma_id: '',
    paket_id: '',
    cekim_turu_id: '',
    baslangic_tarihi: '',
    saat: '',
    durum: 'rezervasyon',
    notlar: ''
  });

  useEffect(() => {
    const unsubShoots = subscribeToCollection('shoots', setShoots);
    const unsubPeople = subscribeToCollection('people', setPeople);
    const unsubCompanies = subscribeToCollection('companies', setCompanies);
    const unsubPackages = subscribeToCollection('packages', setPackages);
    const unsubTypes = subscribeToCollection('shoot_types', setShootTypes);
    return () => {
      unsubShoots();
      unsubPeople();
      unsubCompanies();
      unsubPackages();
      unsubTypes();
    };
  }, []);

  // Handle navigation state
  useEffect(() => {
    if (location.state) {
      const { editShootId, initialDate, openModal } = location.state as any;
      
      if (editShootId && shoots.length > 0) {
        const shootToEdit = shoots.find(s => s.id === editShootId);
        if (shootToEdit) {
          handleOpenModal(shootToEdit);
        }
      } else if (openModal) {
        handleOpenModal(null, initialDate);
      }
    }
  }, [location.state, shoots]);

  const handleOpenModal = (shoot: any = null, initialDate: string = '') => {
    if (shoot) {
      setEditingShoot(shoot);
      setFormData({
        kisi_id: shoot.kisi_id || '',
        firma_id: shoot.firma_id || '',
        paket_id: shoot.paket_id || '',
        cekim_turu_id: shoot.cekim_turu_id || '',
        baslangic_tarihi: shoot.baslangic_tarihi?.split('T')[0] || '',
        saat: shoot.baslangic_tarihi ? format(new Date(shoot.baslangic_tarihi), 'HH:mm') : '',
        durum: shoot.durum || 'rezervasyon',
        notlar: shoot.notlar || ''
      });
    } else {
      setEditingShoot(null);
      setFormData({
        kisi_id: '',
        firma_id: '',
        paket_id: '',
        cekim_turu_id: '',
        baslangic_tarihi: initialDate || new Date().toISOString().split('T')[0],
        saat: '',
        durum: 'rezervasyon',
        notlar: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const person = people.find(p => p.id === formData.kisi_id);
      const type = shootTypes.find(t => t.id === formData.cekim_turu_id);
      
      const dateTime = new Date(`${formData.baslangic_tarihi}T${formData.saat || '00:00'}`);
      
      const data = {
        ...formData,
        baslangic_tarihi: dateTime.toISOString(),
        kisi_ad: person ? `${person.ad} ${person.soyad}` : 'Bilinmeyen Kişi',
        tur_ad: type ? type.ad : 'Bilinmeyen Tür'
      };

      if (editingShoot) {
        await updateItem('shoots', editingShoot.id, data);
      } else {
        await addItem('shoots', data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving shoot:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu çekimi silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('shoots', id);
      } catch (error) {
        console.error('Error deleting shoot:', error);
      }
    }
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const calendarDays = [];

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 border border-slate-100"></div>);
    }

    for (let day = 1; day <= days; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayShoots = shoots.filter(s => s.baslangic_tarihi?.startsWith(dateStr));
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      calendarDays.push(
        <div 
          key={day} 
          onClick={() => handleOpenModal(null, dateStr)}
          className={`h-32 border border-slate-100 p-2 cursor-pointer hover:bg-slate-50 transition-colors relative group ${isToday ? 'bg-primary/5' : 'bg-white'}`}
        >
          <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-400'}`}>{day}</span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
            {dayShoots.map((shoot) => (
              <div 
                key={shoot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(shoot);
                }}
                className={`text-[10px] p-1 rounded truncate font-medium ${
                  shoot.durum === 'tamamlandi' ? 'bg-emerald-100 text-emerald-700' :
                  shoot.durum === 'iptal' ? 'bg-rose-100 text-rose-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}
              >
                {format(new Date(shoot.baslangic_tarihi), 'HH:mm')} - {shoot.kisi_ad}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    handleOpenModal(null, dateStr);
  };

  const filteredShoots = shoots.filter(s => 
    s.kisi_ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tur_ad?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.baslangic_tarihi).getTime() - new Date(a.baslangic_tarihi).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Çekim Yönetimi</h2>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <CalendarIcon size={18} />
            Takvim
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${view === 'list' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <List size={18} />
            Liste
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800 text-lg">
              {currentDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Bugün
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 uppercase">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Çekimlerde ara..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              Yeni Çekim Oluştur
            </button>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Tarih & Saat</th>
                    <th className="px-6 py-4 font-bold">Müşteri</th>
                    <th className="px-6 py-4 font-bold">Tür</th>
                    <th className="px-6 py-4 font-bold">Durum</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShoots.map((shoot) => (
                    <tr key={shoot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded text-slate-500">
                            <CalendarIcon size={16} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {format(new Date(shoot.baslangic_tarihi), 'd MMMM yyyy', { locale: tr })}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={10} />
                              {format(new Date(shoot.baslangic_tarihi), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{shoot.kisi_ad}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-600">{shoot.tur_ad}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          shoot.durum === 'tamamlandi' ? 'bg-emerald-100 text-emerald-700' :
                          shoot.durum === 'planlandi' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {shoot.durum}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(shoot)} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(shoot.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
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
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingShoot ? 'Çekimi Düzenle' : 'Yeni Çekim Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri</label>
              <select 
                value={formData.kisi_id}
                onChange={(e) => setFormData({...formData, kisi_id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Müşteri Seçin (Opsiyonel)</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>{person.ad} {person.soyad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Firma</label>
              <select 
                required
                value={formData.firma_id}
                onChange={(e) => setFormData({...formData, firma_id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Firma Seçin</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.firma_adi}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Paket</label>
              <select 
                required
                value={formData.paket_id}
                onChange={(e) => setFormData({...formData, paket_id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Paket Seçin</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.paket_adi}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Çekim Türü</label>
              <select 
                required
                value={formData.cekim_turu_id}
                onChange={(e) => setFormData({...formData, cekim_turu_id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tür Seçin</option>
                {shootTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.ad}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
              <input 
                type="date" 
                required
                value={formData.baslangic_tarihi}
                onChange={(e) => setFormData({...formData, baslangic_tarihi: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Saat</label>
              <input 
                type="time" 
                required
                value={formData.saat}
                onChange={(e) => setFormData({...formData, saat: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
            <select 
              value={formData.durum}
              onChange={(e) => setFormData({...formData, durum: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="rezervasyon">Rezervasyon</option>
              <option value="cekim_yapildi">Çekim Yapıldı</option>
              <option value="montaj">Montaj</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
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
              {editingShoot ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShootsPage;
