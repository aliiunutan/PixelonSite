import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle, MessageSquare } from 'lucide-react';
import { subscribeToCollection, updateItem, deleteItem } from '../../services/firebaseService';

const ReviewsAdminPage = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToCollection('reviews', setReviews);
    return () => unsub();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateItem('reviews', id, { durum: 'aktif' });
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      try {
        await deleteItem('reviews', id);
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Müşteri Yorumları</h2>
        <div className="flex gap-2">
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {reviews.filter(r => r.durum === 'beklemede').length} Onay Bekliyor
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <div key={review.id} className={`card p-6 ${review.durum === 'beklemede' ? 'border-l-4 border-l-amber-400' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  {review.ad_soyad ? review.ad_soyad[0] : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{review.ad_soyad}</h3>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < review.puan ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {review.durum === 'beklemede' && (
                  <button 
                    onClick={() => handleApprove(review.id)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                    title="Onayla"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-lg border border-slate-100">
              "{review.yorum}"
            </p>
            <div className="mt-4 flex justify-between items-center">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                review.durum === 'aktif' ? 'bg-emerald-100 text-emerald-700' :
                review.durum === 'beklemede' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {review.durum}
              </span>
              <span className="text-[10px] text-slate-400">
                {review.olusturulma_tarihi ? new Date(review.olusturulma_tarihi).toLocaleDateString('tr-TR') : '-'}
              </span>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="p-12 text-center text-slate-400 card">
            <MessageSquare className="mx-auto mb-4 opacity-20" size={48} />
            Henüz yorum bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsAdminPage;
