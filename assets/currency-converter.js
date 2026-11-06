(function () {
  'use strict';
  const root = document.getElementById('rayyanCurrencyApp');
  if (!root) return;
  const lang = root.dataset.language || document.documentElement.lang.split('-')[0] || 'ar';
  const copy = {
    ar: {loading:'جارٍ تحميل بيانات الأسعار…', official:'سعر منشور من البنك المركزي العراقي', global:'سعر مرجعي عالمي استرشادي (متوسط، دون سعرَي شراء وبيع)', mixed:'يتضمن هذا التحويل سعراً عالمياً متوسطاً استرشادياً لعملة لا ينشر البنك المركزي سعرها.', updated:'وقت جلب البيانات', asOf:'تاريخ النشرة الرسمية', error:'تعذر جلب تحديث جديد؛ يتم عرض آخر نسخة محفوظة إن توفرت.', unavailable:'هذه العملة غير متاحة في النشرة ولم يصل سعر عالمي لها.', invalid:'أدخل مبلغاً أكبر من صفر.', same:'اختر عملتين مختلفتين.', lastKnown:'تعرض حالياً آخر نسخة رسمية محفوظة؛ لم ينجح التحقق من إصدار أحدث.', sourceCbi:'البنك المركزي العراقي', sourceGlobal:'ExchangeRate.dev (سعر مرجعي استرشادي)', globalAsOf:'تاريخ السعر العالمي', refresh:'تحديث الأسعار', buy:'سعر الشراء', sell:'سعر البيع'},
    en: {loading:'Loading exchange-rate data…', official:'Rate published by the Central Bank of Iraq', global:'Global indicative midpoint (no official buy/sell quote)', mixed:'This conversion uses a global indicative midpoint for a currency not listed by the CBI.', updated:'Rates data fetched at', asOf:'Official bulletin date', error:'A new update could not be fetched; the last saved copy is shown when available.', unavailable:'This currency is not in the bulletin and no global quote was returned.', invalid:'Enter an amount greater than zero.', same:'Choose two different currencies.', lastKnown:'Showing the last saved official bulletin; a newer release could not be verified.', sourceCbi:'Central Bank of Iraq', sourceGlobal:'ExchangeRate.dev (indicative reference)', globalAsOf:'Global rate timestamp', refresh:'Refresh rates', buy:'Buying rate', sell:'Selling rate'},
    ku: {loading:'داتای نرخەکان بار دەکرێت…', official:'نرخ لەلایەن بانکی ناوەندی عێراقەوە بڵاوکراوەتەوە', global:'نرخی ناوەندیی جیهانیی ئاماژەپێکراو (بێ نرخی فەرمی کڕین و فرۆشتن)', mixed:'ئەم گۆڕینە بۆ ئەو دراوەی بانکی ناوەندی نرخی بۆ بڵاونەکردووەتەوە، نرخی ناوەندیی جیهانی بەکاردەهێنێت.', updated:'کاتی وەرگرتنی داتا', asOf:'بەرواری بڵاوکراوەی فەرمی', error:'نوێکردنەوەیەکی نوێ وەرنەگیرا؛ ئەگەر هەبێت دوایین داتای پاشەکەوتکراو پیشان دەدرێت.', unavailable:'نرخی ئەم دراوە بەردەست نییە.', invalid:'بڕێک زیاتر لە سفر بنووسە.', same:'دوو دراوی جیاواز هەڵبژێرە.', lastKnown:'دوایین بڵاوکراوەی پاشەکەوتکراو پیشان دەدرێت.', sourceCbi:'بانکی ناوەندی عێراق', sourceGlobal:'ExchangeRate.dev (نرخی ئاماژەپێکراو)', globalAsOf:'بەرواری نرخی جیهانی', refresh:'نوێکردنەوەی نرخەکان', buy:'نرخی کڕین', sell:'نرخی فرۆشتن'},
    fa: {loading:'در حال دریافت اطلاعات نرخ‌ها…', official:'نرخ منتشرشده توسط بانک مرکزی عراق', global:'نرخ میانی جهانی و تقریبی (بدون نرخ رسمی خرید و فروش)', mixed:'این تبدیل برای ارزی که در فهرست بانک نیست از نرخ میانی مرجع جهانی استفاده می‌کند.', updated:'زمان دریافت داده‌ها', asOf:'تاریخ بولتن رسمی', error:'داده جدید دریافت نشد؛ در صورت وجود، آخرین نسخه ذخیره‌شده نمایش داده می‌شود.', unavailable:'نرخ این ارز در دسترس نیست.', invalid:'مبلغی بیشتر از صفر وارد کنید.', same:'دو ارز متفاوت انتخاب کنید.', lastKnown:'آخرین بولتن ذخیره‌شده نمایش داده می‌شود.', sourceCbi:'بانک مرکزی عراق', sourceGlobal:'ExchangeRate.dev (نرخ مرجع تقریبی)', globalAsOf:'زمان نرخ جهانی', refresh:'به‌روزرسانی نرخ‌ها', buy:'نرخ خرید', sell:'نرخ فروش'}
  }[lang] || {};
  const currencyNames = {
    IQD:{ar:'الدينار العراقي',en:'Iraqi Dinar',ku:'دیناری عێراقی',fa:'دینار عراق'}, USD:{ar:'الدولار الأمريكي',en:'US Dollar',ku:'دۆلاری ئەمریکی',fa:'دلار آمریکا'}, EUR:{ar:'اليورو',en:'Euro',ku:'یۆرۆ',fa:'یورو'}, TRY:{ar:'الليرة التركية',en:'Turkish Lira',ku:'لیری تورکی',fa:'لیر ترکیه'}, JOD:{ar:'الدينار الأردني',en:'Jordanian Dinar',ku:'دیناری ئوردنی',fa:'دینار اردن'}, GBP:{ar:'الجنيه الإسترليني',en:'Pound Sterling',ku:'پاوەندی بەریتانی',fa:'پوند بریتانیا'}, AED:{ar:'الدرهم الإماراتي',en:'UAE Dirham',ku:'دیرهەمی ئیماراتی',fa:'درهم امارات'}, SAR:{ar:'الريال السعودي',en:'Saudi Riyal',ku:'ڕیاڵی سعودی',fa:'ریال سعودی'}, KWD:{ar:'الدينار الكويتي',en:'Kuwaiti Dinar',ku:'دیناری کوەیتی',fa:'دینار کویت'}, QAR:{ar:'الريال القطري',en:'Qatari Riyal',ku:'ڕیاڵی قەتەری',fa:'ریال قطر'}, OMR:{ar:'الريال العُماني',en:'Omani Rial',ku:'ڕیاڵی عومانی',fa:'ریال عمان'}, BHD:{ar:'الدينار البحريني',en:'Bahraini Dinar',ku:'دیناری بەحرەینی',fa:'دینار بحرین'}, EGP:{ar:'الجنيه المصري',en:'Egyptian Pound',ku:'پاوندی میسری',fa:'پوند مصر'}, LBP:{ar:'الليرة اللبنانية',en:'Lebanese Pound',ku:'لیری لوبنانی',fa:'لیره لبنان'}, CAD:{ar:'الدولار الكندي',en:'Canadian Dollar',ku:'دۆلاری کەنەدی',fa:'دلار کانادا'}, CHF:{ar:'الفرنك السويسري',en:'Swiss Franc',ku:'فرانکی سویسری',fa:'فرانک سوئیس'}, SEK:{ar:'الكرونة السويدية',en:'Swedish Krona',ku:'کرۆنی سویدی',fa:'کرون سوئد'}, NOK:{ar:'الكرونة النرويجية',en:'Norwegian Krone',ku:'کرۆنی نەرویجی',fa:'کرون نروژ'}, DKK:{ar:'الكرونة الدنماركية',en:'Danish Krone',ku:'کرۆنی دانیمارکی',fa:'کرون دانمارک'}, JPY:{ar:'الين الياباني',en:'Japanese Yen',ku:'یەنی ژاپۆنی',fa:'ین ژاپن'}, CNY:{ar:'اليوان الصيني',en:'Chinese Yuan',ku:'یوانی چینی',fa:'یوان چین'}, AUD:{ar:'الدولار الأسترالي',en:'Australian Dollar',ku:'دۆلاری ئۆسترالی',fa:'دلار استرالیا'}, INR:{ar:'الروبية الهندية',en:'Indian Rupee',ku:'ڕوپیەی هیندی',fa:'روپیه هند'}, PKR:{ar:'الروبية الباكستانية',en:'Pakistani Rupee',ku:'ڕوپیەی پاکستانی',fa:'روپیه پاکستان'}, RUB:{ar:'الروبل الروسي',en:'Russian Ruble',ku:'ڕوبڵی ڕووسی',fa:'روبل روسیه'}, MAD:{ar:'الدرهم المغربي',en:'Moroccan Dirham',ku:'دیرهەمی مەغریبی',fa:'درهم مراکش'}, TND:{ar:'الدينار التونسي',en:'Tunisian Dinar',ku:'دیناری تونسی',fa:'دینار تونس'}, ZAR:{ar:'الراند الجنوب أفريقي',en:'South African Rand',ku:'ڕاندی ئەفریقای باشوور',fa:'رند آفریقای جنوبی'}, SGD:{ar:'الدولار السنغافوري',en:'Singapore Dollar',ku:'دۆلاری سینگاپوری',fa:'دلار سنگاپور'}, MYR:{ar:'الرينغيت الماليزي',en:'Malaysian Ringgit',ku:'ڕینگیتی مالیزی',fa:'رینگیت مالزی'}, THB:{ar:'البات التايلندي',en:'Thai Baht',ku:'باتی تایلەندی',fa:'بات تایلند'}, NZD:{ar:'الدولار النيوزيلندي',en:'New Zealand Dollar',ku:'دۆلاری نیوزیلەندی',fa:'دلار نیوزیلند'}, KRW:{ar:'الوون الكوري الجنوبي',en:'South Korean Won',ku:'وۆنی کۆریای باشوور',fa:'وون کره جنوبی'}, IDR:{ar:'الروبية الإندونيسية',en:'Indonesian Rupiah',ku:'ڕوپیەی ئیندۆنیسی',fa:'روپیه اندونزی'}, PLN:{ar:'الزلوتي البولندي',en:'Polish Zloty',ku:'زلۆتی پۆڵەندی',fa:'زلوتی لهستان'}, CZK:{ar:'الكرونة التشيكية',en:'Czech Koruna',ku:'کرۆنی چێکی',fa:'کرون چک'}, HUF:{ar:'الفورنت المجري',en:'Hungarian Forint',ku:'فۆرینتی مەجاری',fa:'فورینت مجارستان'}, UAH:{ar:'الهريفنيا الأوكرانية',en:'Ukrainian Hryvnia',ku:'هریڤنیای ئۆکراینی',fa:'گریونا اوکراین'}, PHP:{ar:'البيزو الفلبيني',en:'Philippine Peso',ku:'پێسۆی فلیپینی',fa:'پزوی فیلیپین'}, HKD:{ar:'دولار هونغ كونغ',en:'Hong Kong Dollar',ku:'دۆلاری هۆنگ کۆنگ',fa:'دلار هنگ‌کنگ'}, BRL:{ar:'الريال البرازيلي',en:'Brazilian Real',ku:'ڕیاڵی بەرازیلی',fa:'رئال برزیل'}, MXN:{ar:'البيزو المكسيكي',en:'Mexican Peso',ku:'پێسۆی مەکسیکی',fa:'پزوی مکزیک'}, ILS:{ar:'الشيكل الإسرائيلي',en:'Israeli New Shekel',ku:'شێکڵی ئیسرائیلی',fa:'شِکِل اسرائیل'}, LKR:{ar:'الروبية السريلانكية',en:'Sri Lankan Rupee',ku:'ڕوپیەی سریلانکایی',fa:'روپیه سریلانکا'}, NPR:{ar:'الروبية النيبالية',en:'Nepalese Rupee',ku:'ڕوپیەی نیپاڵی',fa:'روپیه نپال'}, AFN:{ar:'الأفغاني',en:'Afghan Afghani',ku:'ئەفغانی',fa:'افغانی افغانستان'}, IRR:{ar:'الريال الإيراني',en:'Iranian Rial',ku:'ڕیاڵی ئێرانی',fa:'ریال ایران'}, NGN:{ar:'النايرا النيجيرية',en:'Nigerian Naira',ku:'نەیرای نیجیری',fa:'نایرا نیجریه'}, SDR:{ar:'حقوق السحب الخاصة',en:'Special Drawing Rights',ku:'مافی تایبەتی ڕاکێشان',fa:'حق برداشت ویژه'}
  };
  const $ = (id) => document.getElementById(id);
  const amount = $('rayyanFromAmount'), from = $('rayyanFromCurrency'), to = $('rayyanToCurrency');
  const out = $('rayyanToAmount'), rateLine = $('rayyanRateLine'), sourceLine = $('rayyanSourceLine');
  const asOf = $('rayyanAsOf'), updated = $('rayyanUpdated'), status = $('rayyanRateStatus');
  const officialTable = $('rayyanOfficialTable');
  let dataset = null, side = 'buy';
  if (from) from.value = 'USD';
  if (to) to.value = 'IQD';
  const format = (n, max=4) => new Intl.NumberFormat('en-US',{maximumFractionDigits:max,minimumFractionDigits:0}).format(n);
  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const locale = {ar:'ar-IQ',en:'en-IQ',ku:'en-IQ',fa:'fa-IR'}[lang] || 'en-IQ';
    return new Intl.DateTimeFormat(locale,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Baghdad'}).format(d);
  };
  function getRate(code) {
    if (code === 'IQD') return {value:1,official:true,source:'CBI'};
    const row = dataset && dataset.rates && dataset.rates[code];
    if (!row) return null;
    const isOfficial = row.official === true || row.source === 'CBI';
    const value = isOfficial ? Number(row[side]) : Number(row.mid || row.rateIqd);
    if (!Number.isFinite(value) || value <= 0) return null;
    return {value,official:isOfficial,source:row.source || (isOfficial?'CBI':'global'),dataUpdatedAt:row.dataUpdatedAt || (dataset.fallbackMeta && dataset.fallbackMeta.dataUpdatedAt) || null};
  }
  function updateResult() {
    if (!dataset) return;
    const n = Number(amount.value), a = from.value, b = to.value;
    if (!Number.isFinite(n) || n <= 0) { out.textContent = '—'; status.textContent = copy.invalid; status.classList.add('is-error'); return; }
    if (a === b) { out.textContent = format(n,4); status.textContent = copy.same; status.classList.remove('is-error'); rateLine.textContent = '1 ' + a + ' = 1 ' + b; return; }
    const ra = getRate(a), rb = getRate(b);
    if (!ra || !rb) { out.textContent = '—'; status.textContent = copy.unavailable; status.classList.add('is-error'); rateLine.textContent = '—'; sourceLine.textContent = ''; return; }
    const cross = ra.value / rb.value;
    const result = n * cross;
    out.textContent = format(result, Math.abs(result) < 1 ? 8 : 4);
    rateLine.textContent = '1 ' + a + ' = ' + format(cross,8) + ' ' + b;
    const bothOfficial = ra.official && rb.official;
    const sourceText = bothOfficial ? copy.official : (ra.official || rb.official ? copy.mixed : copy.global);
    const globalTimestamp = (!ra.official && ra.dataUpdatedAt) || (!rb.official && rb.dataUpdatedAt);
    sourceLine.textContent = sourceText + (globalTimestamp ? ' — ' + copy.globalAsOf + ': ' + formatDate(globalTimestamp) : '');
    status.textContent = '';
    status.classList.remove('is-error');
  }
  function renderRatesTable() {
    if (!officialTable || !dataset) return;
    const rows = Object.entries(dataset.rates || {}).filter(([code,r]) => code !== 'IQD' && (r.official === true || r.source === 'CBI'));
    rows.sort((a,b) => a[0].localeCompare(b[0]));
    officialTable.innerHTML = rows.map(([code,r]) => {
      const name = (currencyNames[code] && currencyNames[code][lang]) || r.name || code;
      return '<tr><td>' + escapeHtml(name) + '</td><td>' + code + '</td><td>' + format(Number(r.buy),6) + '</td><td>' + format(Number(r.sell),6) + '</td></tr>';
    }).join('') || '<tr><td colspan="4">' + copy.unavailable + '</td></tr>';
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function updateMeta() {
    const d = dataset && dataset.asOfDate;
    asOf.textContent = d || '—';
    updated.textContent = formatDate(dataset && dataset.fetchedAt);
    if (dataset && (dataset.status === 'snapshot' || dataset.status === 'stale')) {
      status.textContent = copy.lastKnown;
      status.classList.remove('is-error');
    }
  }
  async function fetchData(url) {
    const r = await fetch(url,{headers:{'Accept':'application/json'},cache:'no-store'});
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if (!data || !data.rates || !Object.keys(data.rates).length) throw new Error('Invalid rates response');
    return data;
  }
  async function loadData(showLoading=true) {
    if (showLoading) { status.textContent = copy.loading; status.classList.remove('is-error'); }
    const config = window.RAYYAN_CURRENCY_CONFIG || {};
    const api = config.apiEndpoint || '/api/currency-rates.js';
    const snapshot = config.snapshotEndpoint || '/data/currency-rates.json';
    try {
      dataset = await fetchData(api);
    } catch (firstError) {
      try {
        dataset = await fetchData(snapshot);
        if (showLoading) status.textContent = copy.error + ' ' + copy.lastKnown;
      } catch (secondError) {
        status.textContent = copy.error;
        status.classList.add('is-error');
        return;
      }
    }
    updateMeta(); renderRatesTable(); updateResult();
  }
  document.querySelectorAll('[data-rate-side]').forEach(button => button.addEventListener('click', () => {
    side = button.dataset.rateSide;
    document.querySelectorAll('[data-rate-side]').forEach(b => { const active = b === button; b.classList.toggle('is-active',active); b.setAttribute('aria-pressed',active?'true':'false'); });
    updateResult();
  }));
  amount.addEventListener('input', updateResult); from.addEventListener('change', updateResult); to.addEventListener('change', updateResult);
  $('rayyanSwap').addEventListener('click', () => { const old=from.value; from.value=to.value; to.value=old; updateResult(); });
  $('rayyanRefresh').addEventListener('click', () => loadData(true));
  const labels = document.querySelectorAll('.rayyan-currency-rate-toggle button');
  const refresh = $('rayyanRefresh'); if (refresh) refresh.setAttribute('aria-label',copy.refresh);
  loadData(true);
})();
