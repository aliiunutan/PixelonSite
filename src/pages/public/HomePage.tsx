import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Star, Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const HomePage = () => {
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
          <h2 className="text-3xl font-bold mb-4">Neler Yapıyoruz?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">En mutlu günlerinizde, en güzel kareleri yakalamak için buradayız.</p>
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
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{service.desc}</p>
              <Link to="/hizmetler" className="text-primary font-semibold text-sm flex items-center gap-2">
                Detaylı Bilgi <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-20 text-white">
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
