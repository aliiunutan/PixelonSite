import React, { useEffect, useState } from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { getActiveReviews, addItem } from '../../services/firebaseService';
import { useFirebase } from '../../context/FirebaseContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const ReviewsPage = () => {
  const { user } = useFirebase();
  const [reviews, setReviews] = useState<any[]>([]);
  const [formData, setFormData] = useState({ ad_soyad: '', yorum: '', puan: 5 });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShoot, setHasShoot] = useState(false);
  const [isCheckingShoot, setIsCheckingShoot] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const unsubscribe = getActiveReviews((data) => {
      setReviews(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserShoot = async () => {
      if (!user) {
        setHasShoot(false);
        setIsCheckingShoot(false);
        return;
      }

      try {
        let found = false;
        
        if (user.email) {
          const qEmail = query(collection(db, 'shoots'), where('email', '==', user.email));
          const snapEmail = await getDocs(qEmail);
          if (!snapEmail.empty) found = true;
        }

        if (!found && user.displayName) {
          const qName = query(collection(db, 'shoots'), where('ad_soyad', '==', user.displayName));
          const snapName = await getDocs(qName);
          if (!snapName.empty) found = true;
        }

        if (!found) {
          let personId = null;
          if (user.email) {
            const qPersonEmail = query(collection(db, 'people'), where('email', '==', user.email));
            const snapPersonEmail = await getDocs(qPersonEmail);
            if (!snapPersonEmail.empty) personId = snapPersonEmail.docs[0].id;
          }
          if (!personId && user.displayName) {
            const qPersonName = query(collection(db, 'people'), where('ad_soyad', '==', user.displayName));
            const snapPersonName = await getDocs(qPersonName);
            if (!snapPersonName.empty) personId = snapPersonName.docs[0].id;
          }

          if (personId) {
            const qShootPerson = query(collection(db, 'shoots'), where('kisi_id', '==', personId));
            const snapShootPerson = await getDocs(qShootPerson);
            if (!snapShootPerson.empty) found = true;
          }
        }

        setHasShoot(found);
      } catch (error) {
        console.error("Error checking user shoots:", error);
        setHasShoot(false);
      } finally {
        setIsCheckingShoot(false);
      }
    };

    checkUserShoot();
  }, [user]);

  useEffect(() => {
    if (user && user.displayName && !formData.ad_soyad) {
      setFormData(prev => ({ ...prev, ad_soyad: user.displayName || '' }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addItem('reviews', {
        ...formData,
        userId: user?.uid || null,
        durum: 'beklemede',
        created_at: new Date().toISOString()
      });
      setIsSubmitted(true);
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
        {!isCheckingShoot && user && hasShoot && (
          <div className="mb-20 card p-12 text-center max-w-3xl mx-auto">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Yorumunuz Başarıyla Gönderildi</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Değerli yorumunuz için teşekkür ederiz. Yorumunuz onaylandıktan sonra sayfamızda yayınlanacaktır.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Siz de Yorum Yapın</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Deneyimlerinizi paylaşarak diğer çiftlerimize yardımcı olabilirsiniz.</p>
                <form className="space-y-4 text-left max-w-md mx-auto" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adınız Soyadınız</label>
                    <input 
                      type="text" 
                      required
                      value={formData.ad_soyad}
                      onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Puanınız</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, puan: star })}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={
                              star <= (hoverRating || formData.puan)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-800 dark:text-slate-200 fill-white dark:fill-slate-800'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Yorumunuz</label>
                    <textarea 
                      required
                      value={formData.yorum}
                      onChange={(e) => setFormData({ ...formData, yorum: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary h-32" 
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
              </>
            )}
          </div>
        )}

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
                <p className="text-slate-700 dark:text-slate-300 italic mb-6 leading-relaxed">"{review.yorum}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {review.ad_soyad ? review.ad_soyad[0] : '?'}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{review.ad_soyad}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
