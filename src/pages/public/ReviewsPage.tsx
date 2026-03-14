import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { getActiveReviews, addItem } from '../../services/firebaseService';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [formData, setFormData] = useState({ ad_soyad: '', yorum: '', puan: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = getActiveReviews((data) => {
      setReviews(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addItem('reviews', {
        ...formData,
        durum: 'beklemede',
        created_at: new Date().toISOString()
      });
      alert('Yorumunuz başarıyla gönderildi, onaylandıktan sonra yayınlanacaktır.');
      setFormData({ ad_soyad: '', yorum: '', puan: 5 });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20">
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Müşteri Yorumları</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Bizi tercih eden çiftlerimizin deneyimlerini okuyun.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="card p-8 relative">
              <Quote className="absolute top-6 right-8 text-slate-100 w-12 h-12 -z-0" />
              <div className="relative z-10">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < review.puan ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                    />
                  ))}
                </div>
                <p className="text-slate-700 italic mb-6 leading-relaxed">"{review.yorum}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {review.ad_soyad ? review.ad_soyad[0] : '?'}
                  </div>
                  <span className="font-bold text-slate-900">{review.ad_soyad}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 card p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Siz de Yorum Yapın</h2>
          <p className="text-slate-600 mb-8">Deneyimlerinizi paylaşarak diğer çiftlerimize yardımcı olabilirsiniz.</p>
          <form className="space-y-4 text-left max-w-md mx-auto" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adınız Soyadınız</label>
              <input 
                type="text" 
                required
                value={formData.ad_soyad}
                onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Puanınız</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary"
                value={formData.puan}
                onChange={(e) => setFormData({ ...formData, puan: parseInt(e.target.value) })}
              >
                <option value="5">5 Yıldız</option>
                <option value="4">4 Yıldız</option>
                <option value="3">3 Yıldız</option>
                <option value="2">2 Yıldız</option>
                <option value="1">1 Yıldız</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yorumunuz</label>
              <textarea 
                required
                value={formData.yorum}
                onChange={(e) => setFormData({ ...formData, yorum: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-primary h-32" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
