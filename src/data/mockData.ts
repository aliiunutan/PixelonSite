import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface Person {
  id: number;
  ad: string;
  soyad: string;
  telefon?: string;
  email?: string;
  tip: 'musteri' | 'firma_yetkilisi' | 'yonetici';
  firma_id?: number;
}

export interface Company {
  id: number;
  firma_adi: string;
  adres?: string;
  telefon?: string;
  notlar?: string;
}

export interface ShootType {
  id: number;
  ad: string;
  aciklama?: string;
}

export interface Package {
  id: number;
  paket_adi: string;
  icerik: string;
  paket_fiyati: number;
}

export interface Shoot {
  id: number;
  kisi_id?: number;
  firma_id: number;
  paket_id: number;
  cekim_turu_id: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string;
  durum: 'rezervasyon' | 'cekim_yapildi' | 'montaj' | 'tamamlandi';
  notlar?: string;
}

export interface Review {
  id: number;
  ad_soyad: string;
  yorum: string;
  puan: number;
  durum: 'aktif' | 'pasif' | 'beklemede';
}

export interface Payment {
  id: number;
  cekim_id: number;
  toplam_tutar: number;
  kapora: number;
  odeme_durumu: 'beklemede' | 'kismi_odendi' | 'tamamlandi';
}

export const mockPeople: Person[] = [
  { id: 2, ad: 'Ali', soyad: 'Unutan', telefon: '5418088973', email: 'aliiunutan@gmail.com', tip: 'yonetici', firma_id: 1 },
  { id: 3, ad: 'Burak', soyad: 'Şener', email: 'bur@bur.com', tip: 'yonetici', firma_id: 1 },
  { id: 4, ad: '21 mart', soyad: '2026', tip: 'musteri', firma_id: 3 },
  { id: 12, ad: 'Dera', soyad: 'Organizasyon', email: 'dera@org.com', tip: 'firma_yetkilisi', firma_id: 3 },
];

export const mockCompanies: Company[] = [
  { id: 1, firma_adi: 'PixelonMedya', adres: 'HomeOffice', notlar: 'Kendi Firmamız' },
  { id: 2, firma_adi: 'Nilgarden Event', adres: 'Mudanya', notlar: 'Genelde Evlilik teklifleri çekiyoruz' },
  { id: 3, firma_adi: 'Dera Organizasyon', adres: 'Gürsu', notlar: 'Nişan kız isteme kapalı alan 120 kişilik' },
];

export const mockShootTypes: ShootType[] = [
  { id: 1, ad: 'Evlilik Teklifi', aciklama: 'Çeşitli Evlilik teklifleri' },
  { id: 2, ad: 'Nişan', aciklama: 'Sadece Nişan' },
  { id: 5, ad: 'Düğün', aciklama: 'Düğün' },
  { id: 15, ad: 'Klip', aciklama: 'Şarkı türü tarzında klipler' },
  { id: 16, ad: 'Kına' },
];

export const mockPackages: Package[] = [
  { id: 1, paket_adi: 'Klip + Fotoğraf', icerik: '1-3 dakika arasında klip, Etkinlik süresince fotoğraf', paket_fiyati: 5000 },
  { id: 2, paket_adi: 'Aktüel + Fotoğraf', icerik: 'Etkinlik süresince Fotoğraf ve video çekimi', paket_fiyati: 5000 },
];

export const mockShoots: Shoot[] = [
  { id: 1, kisi_id: 4, firma_id: 3, paket_id: 1, cekim_turu_id: 2, baslangic_tarihi: '2026-03-21T18:00:00', durum: 'rezervasyon', notlar: 'Müşteri Adı Belirsiz' },
  { id: 9, kisi_id: 14, firma_id: 3, paket_id: 2, cekim_turu_id: 2, baslangic_tarihi: '2026-04-24T18:30:00', durum: 'rezervasyon' },
];

export const mockReviews: Review[] = [
  { id: 1, ad_soyad: 'Ayşe Yılmaz', yorum: 'Harika bir çekimdi, çok memnun kaldık.', puan: 5, durum: 'aktif' },
  { id: 2, ad_soyad: 'Mehmet Demir', yorum: 'Klipler çok profesyonel olmuş.', puan: 5, durum: 'aktif' },
];

export const mockPayments: Payment[] = [
  { id: 1, cekim_id: 1, toplam_tutar: 5000, kapora: 0, odeme_durumu: 'beklemede' },
];
