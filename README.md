# StockPilot — Akıllı Stok ve Envanter Yönetim Sistemi

StockPilot, küçük bir işletmenin ürünlerini, stok miktarını ve envanter değerini tarayıcıda takip etmek için hazırlanmış bir yönetim panelidir. Uygulama tamamen frontend üzerinde çalışır. Ürünler ve stok hareketleri LocalStorage’da saklanır; backend, veritabanı veya API anahtarı gerekmez.

İlk açılışta ekranı gösterebilmek için örnek demo ürünler ve demo stok hareketleri yüklenir. Bu kayıtlar arayüzde demo olarak belirtilir. `stockpilot_products` anahtarı bir kez yazıldıktan sonra sayfa yenilense de örnek veriler yeniden eklenmez. Tüm ürünler silinirse liste boş kalır.

## Özellikler

- Toplam ürün çeşidi, toplam stok adedi, toplam envanter değeri ve kritik stok sayısı
- Kategori dağılımı ve stok durumu grafikleri
- Son stok hareketleri ve kritik stok uyarı paneli
- Ürün ekleme, düzenleme ve silme
- Ürün arama, kategori filtresi, stok durumu filtresi ve sıralama
- Stok girişi ve stok çıkışı; mevcut stoktan fazla çıkışın engellenmesi
- Minimum stokta veya altındaki ürünler için kritik uyarı, sıfır stok için “Stok Tükendi” etiketi
- Ürün listesini CSV olarak dışa aktarma
- Türk lirası ve Türkiye saat dilimine göre tarih biçimlendirme
- Mobil menü, boş durumlar, form doğrulamaları ve işlem bildirimleri

## Kullanılan teknolojiler

- React
- Vite
- JavaScript
- CSS
- LocalStorage
- Lucide React
- Recharts
- React Hooks (`useState`, `useEffect`, `useMemo`)

## Kurulum adımları

1. Bu klasörü bilgisayarınıza alın.
2. [Node.js](https://nodejs.org/) kurulu olsun.
3. Proje klasöründe bağımlılıkları yükleyin:

```bash
npm install
```

## Çalıştırma komutları

Geliştirme sunucusu:

```bash
npm run dev
```

Üretim derlemesi:

```bash
npm run build
```

Derlenmiş hali yerelde görmek için:

```bash
npm run preview
```

Netlify ayarları `netlify.toml` dosyasındadır.

- Build command: `npm run build`
- Publish directory: `dist`

## Yapay zekânın geliştirme sürecindeki rolü

Bu çalışma, Software Persona eğitiminin ikinci hafta final projesi olarak Cursor içindeki yapay zekâ asistanı ile geliştirildi. Klasör başlangıçta boştu. Asistanın bu oturumda yaptığı işler:

- Vite ile React projesini oluşturdu.
- `lucide-react` ve `recharts` paketlerini kurdu.
- LocalStorage veri katmanını, yalnızca ilk açılışta yüklenen demo veriyi, ürün doğrulamalarını ve stok giriş/çıkış kurallarını yazdı.
- Dashboard, ürün yönetimi, stok hareketleri, grafikler, bildirimler, CSV dışa aktarma ve responsive arayüzü bileşenlere ayırarak hazırladı.
- `npm run lint` ve `npm run build` komutlarını çalıştırdı. Derleme hatasız tamamlandı.
- Ürün ekleme, düzenleme, silme, stok artırma, fazla çıkışı engelleme, kritik stok hesabı ve sayfa yenilemede verinin korunmasını hem veri katmanında hem de headless Chrome üzerinde denedi. Mobil genişlikte menünün açıldığı da aynı turda kontrol edildi.

Yapılmayan iş:

- Ekran görüntüsü alınmadı.

Kod [aramyesil/StockPilot](https://github.com/aramyesil/StockPilot) deposuna gönderildi. Canlı site [stockpilot2.netlify.app](https://stockpilot2.netlify.app/) adresinde yayında.

## Ekran görüntüleri

Görseller henüz eklenmedi. Uygulamayı çalıştırdıktan sonra aşağıdaki dosyalar çekilip bu bölüme eklenebilir:

1. Genel bakış — `docs/ekran-goruntuleri/dashboard.png`
2. Ürün yönetimi — `docs/ekran-goruntuleri/urunler.png`
3. Stok hareketleri — `docs/ekran-goruntuleri/hareketler.png`
4. Mobil menü — `docs/ekran-goruntuleri/mobil.png`

## GitHub ve canlı demo

- GitHub deposu: [https://github.com/aramyesil/StockPilot](https://github.com/aramyesil/StockPilot)
- Canlı demo: [https://stockpilot2.netlify.app/](https://stockpilot2.netlify.app/)
