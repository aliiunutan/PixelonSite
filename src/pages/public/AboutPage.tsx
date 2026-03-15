import React from 'react';
import { Camera, Users, Award, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="pb-20">
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Hakkımızda</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Pixelon Medya olarak, en değerli anlarınızı profesyonel bir bakış açısıyla ölümsüzleştiriyoruz.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=1000" 
              alt="Studio" 
              className="rounded-3xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Hikayemiz</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Yıllar önce bir tutkuyla başlayan yolculuğumuz, bugün yüzlerce mutlu çiftin en özel anlarına tanıklık eden profesyonel bir ekibe dönüştü. Pixelon Medya, sadece fotoğraf çekmek değil, o anın duygusunu ve heyecanını yıllar sonrasına taşıyacak hikayeler yaratmak için kuruldu.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Teknolojiyi yakından takip eden ekipmanlarımız ve sanatsal bakış açımızla, her çekimi kendine has bir sanat eserine dönüştürüyoruz. Düğün, nişan, kına ve özel organizasyonlarda, sizin heyecanınızı paylaşıyor ve en doğal halinizi karelere sığdırıyoruz.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Award size={20} />
                </div>
                <span className="font-semibold text-sm dark:text-slate-300">Yüksek Kalite</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Heart size={20} />
                </div>
                <span className="font-semibold text-sm dark:text-slate-300">Tutkuyla Çekim</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold dark:text-white">Vizyonumuz & Misyonumuz</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold mb-4 text-primary">Misyonumuz</h3>
              <p className="text-slate-600 dark:text-slate-400">Müşterilerimizin en özel günlerini, beklentilerinin ötesinde bir kalite ve profesyonellik ile kaydederek, nesiller boyu saklanacak anılar oluşturmak.</p>
            </div>
            <div className="card p-8 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold mb-4 text-primary">Vizyonumuz</h3>
              <p className="text-slate-600 dark:text-slate-400">Türkiye'nin en çok tercih edilen ve sanatsal bakış açısıyla fark yaratan fotoğrafçılık ve prodüksiyon firması olmak.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
