import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';

const collectionsMap = {
  shoots: 'cekimler',
  shoot_types: 'cekim_turleri',
  companies: 'firmalar',
  firm_pricing: 'firma_paket_fiyatlari',
  people: 'kisiler',
  reviews: 'musteri_yorumlari',
  tasks: 'not_gorev',
  payments: 'odeme_fatura',
  packages: 'paketler',
  calendar: 'takvim'
};

const sqlData = {
  shoots: [
    { id: "1", kisi_id: 4, firma_id: 3, paket_id: 1, baslangic_tarihi: "2026-03-21 18:00:00", bitis_tarihi: "2026-03-21 20:30:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:48:00", cekim_turu_id: 2 },
    { id: "2", kisi_id: 5, firma_id: 3, paket_id: 1, baslangic_tarihi: "2026-03-22 18:00:00", bitis_tarihi: "2026-03-22 20:30:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:49:52", cekim_turu_id: 2 },
    { id: "3", kisi_id: 6, firma_id: 3, paket_id: 2, baslangic_tarihi: "2026-03-28 18:00:00", bitis_tarihi: "2026-03-28 22:00:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:50:52", cekim_turu_id: 2 },
    { id: "4", kisi_id: 7, firma_id: 3, paket_id: 1, baslangic_tarihi: "2026-04-04 18:30:00", bitis_tarihi: "2026-04-04 21:00:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:51:39", cekim_turu_id: 6 },
    { id: "5", kisi_id: 8, firma_id: 3, paket_id: 1, baslangic_tarihi: "2026-04-05 18:30:00", bitis_tarihi: "2026-04-05 21:00:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:52:29", cekim_turu_id: 2 },
    { id: "6", kisi_id: 9, firma_id: 3, paket_id: 2, baslangic_tarihi: "2026-04-11 13:00:00", bitis_tarihi: "2026-04-11 16:00:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:53:11", cekim_turu_id: 2 },
    { id: "7", kisi_id: 10, firma_id: 3, paket_id: 2, baslangic_tarihi: "2026-05-02 18:30:00", bitis_tarihi: "2026-05-02 22:00:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:54:09", cekim_turu_id: 16 },
    { id: "8", kisi_id: 11, firma_id: 3, paket_id: 2, baslangic_tarihi: "2026-07-12 18:30:00", bitis_tarihi: "2026-07-12 22:00:00", durum: "rezervasyon", notlar: "Müşteri Adı Belirsiz tarih olarak belirtildi", kayit_tarihi: "2026-03-11 19:54:51", cekim_turu_id: 16 },
    { id: "9", kisi_id: 14, firma_id: 3, paket_id: 2, baslangic_tarihi: "2026-04-24 18:30:00", bitis_tarihi: "2026-04-24 20:30:00", durum: "rezervasyon", notlar: "", kayit_tarihi: "2026-03-13 06:23:25", cekim_turu_id: 2 }
  ],
  shoot_types: [
    { id: "1", ad: "Evlilik Teklifi", aciklama: "Çeşitli Evlilik teklifleri", kayit_tarihi: "2026-03-11 19:22:54" },
    { id: "2", ad: "Nişan", aciklama: "Sadece Nişan", kayit_tarihi: "2026-03-11 19:23:02" },
    { id: "3", ad: "Kız İsteme", aciklama: "Sadece Kız İsteme", kayit_tarihi: "2026-03-11 19:23:13" },
    { id: "4", ad: "Sünnet", aciklama: "Sünnet", kayit_tarihi: "2026-03-11 19:23:20" },
    { id: "5", ad: "Düğün", aciklama: "Düğün", kayit_tarihi: "2026-03-11 19:23:25" },
    { id: "6", ad: "Kız İsteme + Nişan", aciklama: "İkisi beraber", kayit_tarihi: "2026-03-11 19:23:44" },
    { id: "7", ad: "Düğün + Dış Çekim", aciklama: "Düğün ve dış çekim", kayit_tarihi: "2026-03-11 19:23:57" },
    { id: "8", ad: "Konvoy", aciklama: "Konvoy Çekimi", kayit_tarihi: "2026-03-11 19:24:11" },
    { id: "9", ad: "Dış Çekim", aciklama: "Sade Dış Çekimler", kayit_tarihi: "2026-03-11 19:25:40" },
    { id: "10", ad: "Gelin Alma", aciklama: "Gelin alımı", kayit_tarihi: "2026-03-11 19:26:42" },
    { id: "11", ad: "Gelin Alma + Konvoy", aciklama: "Gelin alma ve konvoy", kayit_tarihi: "2026-03-11 19:26:56" },
    { id: "12", ad: "Sünnet + Konvoy", aciklama: "", kayit_tarihi: "2026-03-11 19:29:13" },
    { id: "13", ad: "Firma Tanıtım", aciklama: "", kayit_tarihi: "2026-03-11 19:29:19" },
    { id: "14", ad: "Sosyal Medya Reels", aciklama: "", kayit_tarihi: "2026-03-11 19:29:28" },
    { id: "15", ad: "Klip", aciklama: "Şarkı türü tarzında klipler", kayit_tarihi: "2026-03-11 19:29:36" },
    { id: "16", ad: "Kına", aciklama: "", kayit_tarihi: "2026-03-11 19:34:15" },
    { id: "17", ad: "Kısa film", aciklama: "Kısa Filmler", kayit_tarihi: "2026-03-11 19:34:49" }
  ],
  companies: [
    { id: "1", firma_adi: "PixelonMedya", adres: "HomeOffice", telefon: "", notlar: "Kendi Firmamız", kayit_tarihi: "2026-03-11 19:17:52" },
    { id: "2", firma_adi: "Nilgarden Event", adres: "Mudanya", telefon: "", notlar: "Genelde Evlilik teklifleri çekiyoruz", kayit_tarihi: "2026-03-11 19:22:01" },
    { id: "3", firma_adi: "Dera Organizasyon", adres: "Gürsu", telefon: "", notlar: "Nişan kız isteme kapalı alan 120 kişilik", kayit_tarihi: "2026-03-11 19:22:22" }
  ],
  firm_pricing: [
    { id: "1", firma_id: 3, paket_id: 2, ozel_fiyat: 3500.00, kayit_tarihi: "2026-03-11 19:43:19" },
    { id: "2", firma_id: 3, paket_id: 1, ozel_fiyat: 3500.00, kayit_tarihi: "2026-03-11 19:43:25" }
  ],
  people: [
    { id: "1", ad: "deneme", soyad: "dez", telefon: null, email: "d@d.com", sifre: null, telegram_kullanici: null, telegram_id: null, tip: "musteri", firma_id: null, notlar: null, kayit_tarihi: "2026-03-11 19:16:14" },
    { id: "2", ad: "Ali", soyad: "Unutan", telefon: "5418088973", email: "aliiunutan@gmail.com", sifre: "198899", telegram_kullanici: "csofts", telegram_id: "5389117573", tip: "yonetici", firma_id: 1, notlar: "", kayit_tarihi: "2026-03-11 19:16:56" },
    { id: "3", ad: "Burak", soyad: "Şener", telefon: "", email: "bur@bur.com", sifre: "4321", telegram_kullanici: "", telegram_id: "", tip: "yonetici", firma_id: 1, notlar: "", kayit_tarihi: "2026-03-11 19:17:34" },
    { id: "4", ad: "21 mart", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:44:29" },
    { id: "5", ad: "22 mart", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:44:38" },
    { id: "6", ad: "28 Mart", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:44:46" },
    { id: "7", ad: "4 Nisan", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:44:56" },
    { id: "8", ad: "5 Nisan", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:45:25" },
    { id: "9", ad: "11 Nisan", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:46:20" },
    { id: "10", ad: "2 Mayıs", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:46:30" },
    { id: "11", ad: "12 Temmuz", soyad: "2026", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 19:46:39" },
    { id: "12", ad: "Dera", soyad: "Organizasyon", telefon: "", email: "dera@org.com", sifre: "4321", telegram_kullanici: "", telegram_id: "", tip: "firma_yetkilisi", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-11 21:00:08" },
    { id: "13", ad: "Nilgarden", soyad: "Event", telefon: "", email: "nil@garden.com", sifre: "4321", telegram_kullanici: "", telegram_id: "", tip: "firma_yetkilisi", firma_id: 2, notlar: "", kayit_tarihi: "2026-03-12 07:45:40" },
    { id: "14", ad: "24", soyad: "Nisan", telefon: "", email: "", sifre: "", telegram_kullanici: "", telegram_id: "", tip: "musteri", firma_id: 3, notlar: "", kayit_tarihi: "2026-03-13 06:22:03" }
  ],
  payments: [
    { id: "1", cekim_id: 1, kisi_id: 4, firma_id: 3, toplam_tutar: 5000.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:49:07" },
    { id: "2", cekim_id: 2, kisi_id: 5, firma_id: 3, toplam_tutar: 5000.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:56:42" },
    { id: "3", cekim_id: 3, kisi_id: 6, firma_id: 3, toplam_tutar: 3500.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:56:53" },
    { id: "4", cekim_id: 4, kisi_id: 7, firma_id: 3, toplam_tutar: 3500.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:57:02" },
    { id: "5", cekim_id: 5, kisi_id: 8, firma_id: 3, toplam_tutar: 3500.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:57:10" },
    { id: "6", cekim_id: 6, kisi_id: 9, firma_id: 3, toplam_tutar: 3500.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:57:19" },
    { id: "7", cekim_id: 7, kisi_id: 10, firma_id: 3, toplam_tutar: 3500.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:57:29" },
    { id: "8", cekim_id: 8, kisi_id: 11, firma_id: 3, toplam_tutar: 3500.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-11 20:57:35" },
    { id: "9", cekim_id: 9, kisi_id: 14, firma_id: 3, toplam_tutar: 3500.00, kapora: 0.00, odeme_tarihi: null, odeme_durumu: "beklemede", notlar: "", kayit_tarihi: "2026-03-13 06:23:54" }
  ],
  packages: [
    { id: "1", paket_adi: "Klip + Fotoğraf", icerik: "1-3 dakika arasında klip\nEtkinlik süresince fotoğraf\nKlip çekimlerinde takı çekimi olmamakla birlikte\ntakı esnasında eğer istenirse ve poz verilirse fotoğraf çekilmektedir", paket_fiyati: 5000.00, notlar: "", kayit_tarihi: "2026-03-11 19:31:51" },
    { id: "2", paket_adi: "Aktüel + Fotoğraf", icerik: "Etkinlik süresince Fotoğraf ve video çekimi\nEtkinlik gelin ve damadın çıkışı ile başlar", paket_fiyati: 5000.00, notlar: "", kayit_tarihi: "2026-03-11 19:33:30" }
  ]
};

const DatabaseUpdatePage = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleUpdate = async () => {
    if (!window.confirm('DİKKAT: Bu işlem mevcut tüm verileri silecek ve SQL dosyasındaki verileri yükleyecektir. Emin misiniz?')) {
      return;
    }

    setIsUpdating(true);
    setStatus({ type: 'idle', message: '' });
    setLogs([]);

    try {
      addLog('Veritabanı güncellemesi başlatılıyor...');
      
      // 1. Clear all collections
      for (const collectionName of Object.keys(collectionsMap)) {
        addLog(`${collectionName} koleksiyonu temizleniyor...`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        const batches = [];
        let currentBatch = writeBatch(db);
        let operationCount = 0;
        
        querySnapshot.forEach((document) => {
          currentBatch.delete(document.ref);
          operationCount++;
          
          if (operationCount === 500) {
            batches.push(currentBatch.commit());
            currentBatch = writeBatch(db);
            operationCount = 0;
          }
        });
        
        if (operationCount > 0) {
          batches.push(currentBatch.commit());
        }
        
        await Promise.all(batches);
      }
      
      addLog('Tüm eski veriler temizlendi. Yeni veriler ekleniyor...');
      
      // 2. Insert new data
      for (const [collectionName, items] of Object.entries(sqlData)) {
        addLog(`${collectionName} koleksiyonuna veriler ekleniyor...`);
        
        const batches = [];
        let currentBatch = writeBatch(db);
        let operationCount = 0;
        
        for (const item of items) {
          const docRef = doc(db, collectionName, item.id);
          const { id, ...dataWithoutId } = item as any;
          
          // Convert date strings to ISO format if needed, but for now we keep them as strings
          // since the app uses strings for dates in many places.
          if (dataWithoutId.baslangic_tarihi) {
            dataWithoutId.baslangic_tarihi = dataWithoutId.baslangic_tarihi.replace(' ', 'T');
          }
          if (dataWithoutId.bitis_tarihi) {
            dataWithoutId.bitis_tarihi = dataWithoutId.bitis_tarihi.replace(' ', 'T');
          }
          
          currentBatch.set(docRef, dataWithoutId);
          operationCount++;
          
          if (operationCount === 500) {
            batches.push(currentBatch.commit());
            currentBatch = writeBatch(db);
            operationCount = 0;
          }
        }
        
        if (operationCount > 0) {
          batches.push(currentBatch.commit());
        }
        
        await Promise.all(batches);
      }
      
      addLog('Veritabanı başarıyla güncellendi!');
      setStatus({ type: 'success', message: 'Veritabanı başarıyla güncellendi. Artık web sitesi ve dashboard yeni verileri kullanıyor.' });
    } catch (error: any) {
      console.error('Error updating database:', error);
      addLog(`HATA: ${error.message}`);
      setStatus({ type: 'error', message: 'Veritabanı güncellenirken bir hata oluştu.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Database className="text-primary" />
          Veritabanı Güncelleme
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Bu araç, mevcut Firebase veritabanındaki verileri silip, sağladığınız SQL yedeğindeki verileri yükler.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg mb-6">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold">Dikkat!</h3>
            <p className="text-sm mt-1">
              Bu işlem geri alınamaz. Mevcut çalışan veritabanındaki tüm veriler silinecek ve yerine SQL dosyasındaki veriler yüklenecektir. Web sitesi ve dashboard'daki isimler, alanlar ve tablo yapıları <strong>değiştirilmeden</strong> sadece veriler güncellenecektir.
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isUpdating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Güncelleniyor...
            </>
          ) : (
            <>
              <Database size={20} />
              Veritabanını Güncelle
            </>
          )}
        </button>

        {status.message && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            status.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={20} /> : <AlertTriangle className="shrink-0 mt-0.5" size={20} />}
            <p className="font-medium">{status.message}</p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">İşlem Günlüğü</h4>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-1">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseUpdatePage;
