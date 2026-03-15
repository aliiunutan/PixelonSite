import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Star, Calendar, Clock, CheckCircle, ArrowRight, Quote } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const HomePage = () => {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching recent reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const dummyReviews = [
    {
      id: 'dummy-1',
      rating: 5,
      comment: 'Harika bir çekimdi, ekibin enerjisi bizi çok rahatlattı. Fotoğraflar beklediğimizden de güzel geldi! Kesinlikle tavsiye ediyoruz.',
      authorName: 'Ayşe & Ahmet',
      createdAt: { toDate: () => new Date('2023-08-15') }
    },
    {
      id: 'dummy-2',
      rating: 5,
      comment: 'Düğün hikayemiz tam bir film gibi olmuş. Her izlediğimizde o güne geri dönüyoruz. Emeğinize sağlık, çok teşekkürler.',
      authorName: 'Zeynep & Can',
      createdAt: { toDate: () => new Date('2023-09-02') }
    },
    {
      id: 'dummy-3',
      rating: 5,
      comment: 'Dış çekim mekan önerileri çok iyiydi. Çok eğlenceli bir gün geçirdik, sonuçlar da muazzam. Herkese tavsiye ederim.',
      authorName: 'Elif & Burak',
      createdAt: { toDate: () => new Date('2023-09-20') }
    }
  ];

  const displayReviews = recentReviews.length > 0 ? recentReviews : dummyReviews;

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000" 
            alt="Wedding" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Anılarınızı Ölümsüzleştiriyoruz</h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 font-light">
            Düğün, nişan ve tüm özel organizasyonlarınızda profesyonel fotoğraf ve video çözümleriyle yanınızdayız.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/randevular" className="btn-primary text-lg px-8 py-3">Hemen Randevu Al</Link>
            <Link to="/hizmetler" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-lg hover:bg-white/20 transition-colors">Hizmetlerimizi İnceleyin</Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Neler Yapıyoruz?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">En mutlu günlerinizde, en güzel kareleri yakalamak için buradayız.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Düğün Hikayesi', desc: 'Tüm gün süren çekimlerle en özel anlarınızı bir filme dönüştürüyoruz.', icon: Camera },
            { title: 'Nişan & Kına', desc: 'Geleneksel ve modern dokunuşlarla nişan ve kına gecelerinizi kaydediyoruz.', icon: Star },
            { title: 'Dış Çekim', desc: 'Doğanın kalbinde veya şehrin ikonik noktalarında sanatsal kareler.', icon: ArrowRight },
          ].map((service, i) => (
            <div key={i} className="card p-8 hover:shadow-lg transition-shadow group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <service.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{service.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{service.desc}</p>
              <Link to="/hizmetler" className="text-primary font-semibold text-sm flex items-center gap-2">
                Detaylı Bilgi <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 dark:bg-slate-950 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-slate-400 text-sm">Mutlu Çift</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10k+</div>
            <div className="text-slate-400 text-sm">Teslim Edilen Fotoğraf</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">150+</div>
            <div className="text-slate-400 text-sm">Düğün Klibi</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">5+</div>
            <div className="text-slate-400 text-sm">Yıllık Deneyim</div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {displayReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Müşteri Yorumları</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Bizimle çalışan çiftlerimizin deneyimleri.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayReviews.map((review) => (
              <div key={review.id} className="card p-8 relative">
                <Quote className="absolute top-6 right-6 text-slate-100 dark:text-slate-800 w-12 h-12" />
                <div className="flex items-center gap-1 mb-4 relative z-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300 dark:text-slate-600"}
                    />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 relative z-10 italic">"{review.comment}"</p>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                    {review.authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{review.authorName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.createdAt?.toDate()).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/yorumlar" className="btn-secondary inline-flex items-center gap-2">
              Tüm Yorumları Gör <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-primary rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Sizin Hikayenizi Ne Zaman Yazalım?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Tarihiniz dolmadan hemen randevu talebi oluşturun, size en uygun paketi birlikte seçelim.</p>
            <Link to="/randevular" className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors inline-block">
              Randevu Takvimini Görüntüle
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
