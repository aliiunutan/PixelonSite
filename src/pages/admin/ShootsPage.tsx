import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar as CalendarIcon, Clock, User, Tag, ChevronLeft, ChevronRight, List, MapPin, Building2 } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem } from '../../services/firebaseService';
import Modal from '../../components/Modal';
import { format, setMonth, setYear, startOfWeek, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';

const ShootsPage = () => {
  const location = useLocation();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [calendarViewType, setCalendarViewType] = useState<'month' | 'week' | 'day'>('month');
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
    bitis_saati: '',
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
        bitis_saati: shoot.bitis_tarihi ? format(new Date(shoot.bitis_tarihi), 'HH:mm') : '',
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
        baslangic_tarihi: initialDate || format(new Date(), 'yyyy-MM-dd'),
        saat: '',
        bitis_saati: '',
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
      const company = companies.find(c => c.id === formData.firma_id);
      
      const dateTime = new Date(`${formData.baslangic_tarihi}T${formData.saat || '00:00'}`);
      const endDateTime = formData.bitis_saati ? new Date(`${formData.baslangic_tarihi}T${formData.bitis_saati}`) : null;
      
      const data = {
        ...formData,
        baslangic_tarihi: dateTime.toISOString(),
        bitis_tarihi: endDateTime ? endDateTime.toISOString() : null,
        kisi_ad: person ? `${person.ad} ${person.soyad}` : 'Bilinmeyen Kişi',
        tur_ad: type ? type.ad : 'Bilinmeyen Tür',
        firma_ad: company ? company.firma_adi : 'Bilinmeyen Firma'
      };
      
      // Remove temporary UI fields
      delete (data as any).saat;
      delete (data as any).bitis_saati;

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
      calendarDays.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"></div>);
    }

    for (let day = 1; day <= days; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayShoots = shoots.filter(s => s.baslangic_tarihi?.startsWith(dateStr));
      const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

      calendarDays.push(
        <div 
          key={day} 
          onClick={() => handleOpenModal(null, dateStr)}
          className={`h-32 border border-slate-100 dark:border-slate-800 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group ${dayShoots.length > 0 ? 'bg-primary/5 dark:bg-primary/10' : isToday ? 'bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}
        >
          <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>{day}</span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
            {dayShoots.map((shoot) => {
              const company = companies.find(c => c.id === shoot.firma_id);
              const firmaAd = shoot.firma_ad || (company ? company.firma_adi : 'Bilinmeyen Firma');
              return (
              <div 
                key={shoot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(shoot);
                }}
                className={`text-[10px] p-1 rounded truncate font-medium ${
                  shoot.durum === 'tamamlandi' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                  shoot.durum === 'cekim_yapildi' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                  shoot.durum === 'montaj' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                  shoot.durum === 'rezervasyon' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title={`${format(new Date(shoot.baslangic_tarihi), 'HH:mm')} - ${firmaAd} - ${shoot.tur_ad} - ${shoot.kisi_ad}`}
              >
                {format(new Date(shoot.baslangic_tarihi), 'HH:mm')} - {firmaAd} - {shoot.tur_ad} - {shoot.kisi_ad}
              </div>
            )})}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  const renderWeekView = () => {
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
    
    return (
      <div className="flex flex-col h-[600px] overflow-y-auto">
        <div className="flex border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="w-16 flex-shrink-0 border-r border-slate-100 dark:border-slate-800"></div>
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(startOfCurrentWeek, i);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} className={`flex-1 py-2 text-center border-r border-slate-100 dark:border-slate-800 ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{format(day, 'EEE', { locale: tr })}</div>
                <div className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-1 relative">
          <div className="w-16 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-slate-100 dark:border-slate-800 relative">
                <span className="absolute -top-3 right-2 text-xs text-slate-400 dark:text-slate-500">{`${hour.toString().padStart(2, '0')}:00`}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 flex relative">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const currentDay = addDays(startOfCurrentWeek, dayIndex);
              const dateStr = format(currentDay, 'yyyy-MM-dd');
              const dayShoots = shoots.filter(s => s.baslangic_tarihi?.startsWith(dateStr));
              
              return (
                <div key={dayIndex} className="flex-1 border-r border-slate-100 dark:border-slate-800 relative" onClick={() => handleOpenModal(null, dateStr)}>
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-slate-100 dark:border-slate-800"></div>
                  ))}
                  {dayShoots.map(shoot => {
                    const shootDate = new Date(shoot.baslangic_tarihi);
                    const startHour = shootDate.getHours() + shootDate.getMinutes() / 60;
                    const endHour = shoot.bitis_tarihi ? (new Date(shoot.bitis_tarihi).getHours() + new Date(shoot.bitis_tarihi).getMinutes() / 60) : startHour + 1;
                    
                    if (startHour < 8 || startHour >= 23) return null; // Outside visible hours
                    
                    const top = (startHour - 8) * 64; // 64px per hour (h-16)
                    const height = Math.max((endHour - startHour) * 64, 32); // Min height 32px
                    
                    const company = companies.find(c => c.id === shoot.firma_id);
                    const firmaAd = shoot.firma_ad || (company ? company.firma_adi : 'Bilinmeyen Firma');
                    
                    return (
                      <div 
                        key={shoot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(shoot);
                        }}
                        className={`absolute left-1 right-1 p-1 rounded text-xs overflow-hidden cursor-pointer shadow-sm border ${
                          shoot.durum === 'tamamlandi' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' :
                          shoot.durum === 'cekim_yapildi' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' :
                          shoot.durum === 'montaj' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' :
                          shoot.durum === 'rezervasyon' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                        style={{ top: `${top}px`, height: `${height}px`, zIndex: 5 }}
                        title={`${format(shootDate, 'HH:mm')} - ${firmaAd} - ${shoot.tur_ad}`}
                      >
                        <div className="font-bold truncate">{format(shootDate, 'HH:mm')}</div>
                        <div className="truncate">{firmaAd}</div>
                        <div className="truncate opacity-80">{shoot.tur_ad}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayShoots = shoots.filter(s => s.baslangic_tarihi?.startsWith(dateStr));
    
    return (
      <div className="flex flex-col h-[600px] overflow-y-auto">
        <div className="flex flex-1 relative">
          <div className="w-16 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b border-slate-100 dark:border-slate-800 relative">
                <span className="absolute -top-3 right-2 text-xs text-slate-400 dark:text-slate-500">{`${hour.toString().padStart(2, '0')}:00`}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative" onClick={() => handleOpenModal(null, dateStr)}>
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b border-slate-100 dark:border-slate-800"></div>
            ))}
            {dayShoots.map(shoot => {
              const shootDate = new Date(shoot.baslangic_tarihi);
              const startHour = shootDate.getHours() + shootDate.getMinutes() / 60;
              const endHour = shoot.bitis_tarihi ? (new Date(shoot.bitis_tarihi).getHours() + new Date(shoot.bitis_tarihi).getMinutes() / 60) : startHour + 1;
              
              if (startHour < 8 || startHour >= 23) return null;
              
              const top = (startHour - 8) * 80; // 80px per hour (h-20)
              const height = Math.max((endHour - startHour) * 80, 40);
              
              const company = companies.find(c => c.id === shoot.firma_id);
              const firmaAd = shoot.firma_ad || (company ? company.firma_adi : 'Bilinmeyen Firma');
              
              return (
                <div 
                  key={shoot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(shoot);
                  }}
                  className={`absolute left-2 right-4 p-2 rounded-lg overflow-hidden cursor-pointer shadow-sm border ${
                    shoot.durum === 'tamamlandi' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' :
                    shoot.durum === 'cekim_yapildi' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' :
                    shoot.durum === 'montaj' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' :
                    shoot.durum === 'rezervasyon' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  style={{ top: `${top}px`, height: `${height}px`, zIndex: 5 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold">{format(shootDate, 'HH:mm')} {shoot.bitis_tarihi ? `- ${format(new Date(shoot.bitis_tarihi), 'HH:mm')}` : ''}</div>
                    <div className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">{shoot.durum.replace('_', ' ').toUpperCase()}</div>
                  </div>
                  <div className="text-lg font-semibold mt-1">{firmaAd}</div>
                  <div className="flex items-center gap-4 mt-2 opacity-80 text-sm">
                    <div className="flex items-center gap-1"><Tag size={14} /> {shoot.tur_ad}</div>
                    <div className="flex items-center gap-1"><User size={14} /> {shoot.kisi_ad}</div>
                  </div>
                  {shoot.notlar && <div className="mt-2 text-sm opacity-70 line-clamp-2">{shoot.notlar}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    handleOpenModal(null, dateStr);
  };

  const filteredShoots = shoots.filter(s => 
    s.kisi_ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tur_ad?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.baslangic_tarihi).getTime() - new Date(a.baslangic_tarihi).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Çekim Yönetimi</h2>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <CalendarIcon size={18} />
            Takvim
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${view === 'list' ? 'bg-primary text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <List size={18} />
            Liste
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg capitalize">
              {calendarViewType === 'month' && currentDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
              {calendarViewType === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM', { locale: tr })} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), 'dd MMM yyyy', { locale: tr })}`}
              {calendarViewType === 'day' && format(currentDate, 'dd MMMM yyyy, EEEE', { locale: tr })}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap mr-2 py-1.5 px-3 text-sm">
                <Plus size={16} />
                Yeni Çekim Oluştur
              </button>
              
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
                <button 
                  onClick={() => setCalendarViewType('month')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${calendarViewType === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Ay
                </button>
                <button 
                  onClick={() => setCalendarViewType('week')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${calendarViewType === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Hafta
                </button>
                <button 
                  onClick={() => setCalendarViewType('day')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${calendarViewType === 'day' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Gün
                </button>
              </div>

              <div className="flex gap-1 mr-2">
                <button 
                  onClick={() => {
                    if (calendarViewType === 'month') {
                      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
                    } else if (calendarViewType === 'week') {
                      setCurrentDate(addDays(currentDate, -7));
                    } else {
                      setCurrentDate(addDays(currentDate, -1));
                    }
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Bugün
                </button>
                <button 
                  onClick={() => {
                    if (calendarViewType === 'month') {
                      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
                    } else if (calendarViewType === 'week') {
                      setCurrentDate(addDays(currentDate, 7));
                    } else {
                      setCurrentDate(addDays(currentDate, 1));
                    }
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              {calendarViewType === 'month' && (
                <div className="flex items-center gap-2">
                  <select 
                    value={currentDate.getMonth()}
                    onChange={(e) => setCurrentDate(setMonth(currentDate, parseInt(e.target.value)))}
                    className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i}>
                        {format(new Date(2024, i, 1), 'MMMM', { locale: tr })}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={currentDate.getFullYear()}
                    onChange={(e) => setCurrentDate(setYear(currentDate, parseInt(e.target.value)))}
                    className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    {Array.from({ length: 11 }).map((_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return (
                        <option key={year} value={year}>{year}</option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {calendarViewType === 'month' && (
            <>
              <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                  <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {renderCalendar()}
              </div>
            </>
          )}
          {calendarViewType === 'week' && renderWeekView()}
          {calendarViewType === 'day' && renderDayView()}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Çekimlerde ara..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              Yeni Çekim Oluştur
            </button>
          </div>

          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Tarih & Saat</th>
                    <th className="px-6 py-4 font-bold">Firma</th>
                    <th className="px-6 py-4 font-bold">Müşteri</th>
                    <th className="px-6 py-4 font-bold">Tür</th>
                    <th className="px-6 py-4 font-bold">Durum</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredShoots.map((shoot) => {
                    const company = companies.find(c => c.id === shoot.firma_id);
                    const firmaAd = shoot.firma_ad || (company ? company.firma_adi : 'Bilinmeyen Firma');
                    return (
                    <tr key={shoot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                            <CalendarIcon size={16} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {format(new Date(shoot.baslangic_tarihi), 'd MMMM yyyy', { locale: tr })}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock size={10} />
                              {format(new Date(shoot.baslangic_tarihi), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400 dark:text-slate-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{firmaAd}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400 dark:text-slate-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{shoot.kisi_ad}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-slate-400 dark:text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{shoot.tur_ad}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          shoot.durum === 'tamamlandi' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                          shoot.durum === 'cekim_yapildi' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                          shoot.durum === 'montaj' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                          shoot.durum === 'rezervasyon' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {shoot.durum === 'cekim_yapildi' ? 'Çekim Yapıldı' : shoot.durum}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(shoot)} className="p-2 text-slate-400 hover:text-primary dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(shoot.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Müşteri</label>
              <select 
                required
                value={formData.kisi_id}
                onChange={(e) => {
                  const selectedKisiId = e.target.value;
                  const person = people.find(p => p.id === selectedKisiId);
                  setFormData(prev => ({
                    ...prev,
                    kisi_id: selectedKisiId,
                    firma_id: person?.firma_id || prev.firma_id
                  }));
                }}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Müşteri Seçin</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>{person.ad} {person.soyad}</option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Çekim Türü</label>
              <select 
                required
                value={formData.cekim_turu_id}
                onChange={(e) => setFormData({...formData, cekim_turu_id: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tür Seçin</option>
                {shootTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.ad}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tarih</label>
              <input 
                type="date" 
                required
                value={formData.baslangic_tarihi}
                onChange={(e) => setFormData({...formData, baslangic_tarihi: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Başlangıç Saati</label>
              <input 
                type="time" 
                required
                value={formData.saat}
                onChange={(e) => setFormData({...formData, saat: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bitiş Saati</label>
              <input 
                type="time" 
                value={formData.bitis_saati}
                onChange={(e) => setFormData({...formData, bitis_saati: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Durum</label>
            <select 
              value={formData.durum}
              onChange={(e) => setFormData({...formData, durum: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="rezervasyon">Rezervasyon</option>
              <option value="cekim_yapildi">Çekim Yapıldı</option>
              <option value="montaj">Montaj</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
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
              {editingShoot ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShootsPage;
