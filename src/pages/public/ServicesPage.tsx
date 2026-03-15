import React from 'react';
import { Camera, Video, Star, Music, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const services = [
    {
      title: 'Düğün Fotoğrafçılığı',
      desc: 'Hazırlık aşamasından gecenin sonuna kadar tüm detayları profesyonelce kaydediyoruz.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Düğün Klibi & Hikayesi',
      desc: 'Sinematik kurgu ile günün en heyecanlı anlarını bir filme dönüştürüyoruz.',
      icon: Video,
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Dış Çekim & Save the Date',
      desc: 'Doğal ışık ve eşsiz mekanlarda sanatsal portre çekimleri gerçekleştiriyoruz.',
      icon: Camera,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Nişan & Kına Gecesi',
      desc: 'Geleneksel törenlerinizin her anını özenle belgeliyoruz.',
      icon: Star,
      image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Evlilik Teklifi',
      desc: 'O sürpriz anı gizlice veya kurgulanmış bir şekilde ölümsüzleştiriyoruz.',
      icon: Music,
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Etkinlik & Tanıtım',
      desc: 'Kurumsal etkinlikler ve firma tanıtımları için profesyonel prodüksiyon.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="pb-20">
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Hizmetlerimiz</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Sizin için en uygun çekim türünü seçin, anılarınızı profesyonellere emanet edin.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div key={i} className="card group hover:shadow-xl transition-all">
              <div className="h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  <service.icon size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{service.desc}</p>
                <Link to="/randevular" className="btn-primary w-full block text-center text-sm">Randevu Al</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
