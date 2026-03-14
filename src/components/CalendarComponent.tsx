import React, { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday 
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Edit2, Info, X, Camera, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { subscribeToCollection } from '../services/firebaseService';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

interface CalendarProps {
  onDateClick?: (date: Date) => void;
  isAdmin?: boolean;
}

const CalendarComponent: React.FC<CalendarProps> = ({ onDateClick, isAdmin = false }) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [shoots, setShoots] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribeShoots = subscribeToCollection('shoots', setShoots);
    return () => {
      unsubscribeShoots();
    };
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getShootsForDay = (day: Date) => {
    return shoots.filter(shoot => isSameDay(new Date(shoot.baslangic_tarihi), day));
  };

  const handleDayClick = (day: Date) => {
    if (isAdmin) {
      setSelectedDay(day);
      setIsDayModalOpen(true);
    }
    onDateClick?.(day);
  };

  const dayShoots = selectedDay ? getShootsForDay(selectedDay) : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: tr })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const dayShoots = getShootsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={i}
              onClick={() => handleDayClick(day)}
              className={`min-h-[120px] p-2 border-r border-b border-slate-100 transition-colors ${
                isAdmin || onDateClick ? 'cursor-pointer hover:bg-slate-50/50' : ''
              } ${!isCurrentMonth ? 'bg-slate-50/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday(day) ? 'bg-primary text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayShoots.map(shoot => (
                  <div 
                    key={shoot.id}
                    className={`text-[10px] p-1.5 rounded font-semibold truncate border-l-2 ${
                      isAdmin 
                        ? (shoot.durum === 'tamamlandi' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' :
                           shoot.durum === 'iptal' ? 'bg-rose-50 text-rose-700 border-rose-500' :
                           'bg-primary/10 text-primary border-primary')
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                    title={isAdmin ? `${shoot.kisi_ad} - ${shoot.tur_ad}` : shoot.tur_ad}
                  >
                    {isAdmin 
                      ? `${format(new Date(shoot.baslangic_tarihi), 'HH:mm')} ${shoot.kisi_ad}`
                      : shoot.tur_ad}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Details Modal - Only for Admin */}
      {isAdmin && (
        <Modal
          isOpen={isDayModalOpen}
          onClose={() => setIsDayModalOpen(false)}
          title={selectedDay ? format(selectedDay, 'd MMMM yyyy', { locale: tr }) : 'Gün Detayları'}
        >
          <div className="space-y-6">
            {dayShoots.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Günün Çekimleri</h3>
                <div className="space-y-3">
                  {dayShoots.map(shoot => (
                    <div key={shoot.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Camera size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{shoot.kisi_ad}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {format(new Date(shoot.baslangic_tarihi), 'HH:mm')} - {shoot.tur_ad}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/admin/cekimler', { state: { editShootId: shoot.id } })}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                  <CalendarIcon size={32} />
                </div>
                <p className="text-slate-500 font-medium">Bu gün için planlanmış bir çekim bulunmuyor.</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => {
                  const dateStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
                  navigate('/admin/cekimler', { state: { initialDate: dateStr, openModal: true } });
                }}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Yeni Çekim Ekle
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarComponent;
