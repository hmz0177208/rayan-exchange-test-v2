const XLSX = require('xlsx');
const CBI_PAGE = 'https://cbi.iq/page/144';
const CBI_LANDING = 'https://cbi.iq/page/144';
const GLOBAL_URL = 'https://api.exchangerate.dev/v1/latest/USD';
const SNAPSHOT_DATE = '2026-11-03';
const SNAPSHOT = {"schemaVersion": 1, "status": "snapshot", "baseCurrency": "IQD", "asOfDate": "2026-11-03", "fetchedAt": null, "officialSource": "Central Bank of Iraq", "officialSourceUrl": "https://cbi.iq/static/uploads/up/file-179377186942051.pdf", "officialLandingUrl": "https://cbi.iq/news/print_news/319", "fallbackSource": "ExchangeRate.dev", "fallbackSourceUrl": "https://exchangerate.dev/", "note": "Official CBI bulletin prices are indicative and do not constitute an obligation on the Central Bank of Iraq.", "rates": {"IQD": {"buy": 1.0, "sell": 1.0, "mid": 1.0, "official": true, "source": "CBI", "name": "Iraqi Dinar"}, "USD": {"buy": 1500.0, "sell": 1520.0, "mid": 1510.0, "official": true, "source": "CBI", "name": "U.S. dollar"}, "EUR": {"buy": 1676.85, "sell": 1699.208, "mid": 1688.029, "official": true, "source": "CBI", "name": "Euro"}, "GBP": {"buy": 2011.65, "sell": 2038.472, "mid": 2025.0610000000001, "official": true, "source": "CBI", "name": "Pound Sterling"}, "CAD": {"buy": 1070.664, "sell": 1084.939, "mid": 1077.8015, "official": true, "source": "CBI", "name": "Canadian Dollar"}, "CHF": {"buy": 1830.541, "sell": 1854.948, "mid": 1842.7445, "official": true, "source": "CBI", "name": "Swiss Franc"}, "SEK": {"buy": 153.332, "sell": 155.376, "mid": 154.35399999999998, "official": true, "source": "CBI", "name": "Swedish Krona"}, "NOK": {"buy": 161.791, "sell": 163.949, "mid": 162.87, "official": true, "source": "CBI", "name": "Norwegian Krone"}, "DKK": {"buy": 224.685, "sell": 227.681, "mid": 226.183, "official": true, "source": "CBI", "name": "Danish Krone"}, "JPY": {"buy": 9.454, "sell": 9.58, "mid": 9.517, "official": true, "source": "CBI", "name": "Japanese Yen"}, "CNY": {"buy": 224.837, "sell": 227.835, "mid": 226.336, "official": true, "source": "CBI", "name": "Chinese Yuan"}, "AED": {"buy": 408.452, "sell": 413.898, "mid": 411.175, "official": true, "source": "CBI", "name": "U.A.E. Dirham"}, "JOD": {"buy": 2118.644, "sell": 2146.893, "mid": 2132.7685, "official": true, "source": "CBI", "name": "Jordanian Dinar"}, "AUD": {"buy": 1046.4, "sell": 1060.352, "mid": 1053.3760000000002, "official": true, "source": "CBI", "name": "Australian Dollar"}, "SAR": {"buy": 400.0, "sell": 405.333, "mid": 402.66650000000004, "official": true, "source": "CBI", "name": "Saudi Riyal"}, "OMR": {"buy": 3901.17, "sell": 3953.186, "mid": 3927.178, "official": true, "source": "CBI", "name": "Omani Rial"}, "INR": {"buy": 15.813, "sell": 16.024, "mid": 15.918500000000002, "official": true, "source": "CBI", "name": "Indian Rupee"}, "TRY": {"buy": 30.021, "sell": 30.421, "mid": 30.221, "official": true, "source": "CBI", "name": "Turkish Lira"}, "QAR": {"buy": 412.088, "sell": 417.582, "mid": 414.83500000000004, "official": true, "source": "CBI", "name": "Qatari Riyal"}, "SDR": {"buy": 2031.42, "sell": 2058.506, "mid": 2044.963, "official": true, "source": "CBI", "name": "Special Drawing Rights"}}};
const SUPPORTED = ["IQD", "USD", "EUR", "TRY", "JOD", "GBP", "AED", "SAR", "KWD", "QAR", "OMR", "BHD", "EGP", "LBP", "CAD", "CHF", "SEK", "NOK", "DKK", "JPY", "CNY", "AUD", "INR", "PKR", "RUB", "MAD", "TND", "ZAR", "SGD", "MYR", "THB", "NZD", "KRW", "IDR", "PLN", "CZK", "HUF", "UAH", "PHP", "HKD", "BRL", "MXN", "ILS", "LKR", "NPR", "AFN", "IRR", "NGN"];

function clean(v) { return String(v == null ? '' : v).replace(/\s+/g,' ').trim().toLowerCase(); }
function num(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v == null ? '' : v).replace(/[٬,\s]/g,'').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫]/g,'.');
  const n = Number(s); return Number.isFinite(n) && n > 0 ? n : null;
}
function codeCell(v) { const s=String(v||'').trim().toUpperCase(); return /^[A-Z]{3}$/.test(s) && SUPPORTED.includes(s) ? s : null; }
function parseRows(rows) {
  let headerIndex=-1, buyIndex=-1, sellIndexes=[], codeIndex=-1;
  for (let i=0;i<Math.min(rows.length,40);i++) {
    const cells=(rows[i]||[]).map(clean);
    const buy=cells.findIndex(x => /\bbuy\b|شراء/.test(x));
    const sells=[]; cells.forEach((x,j)=>{ if (/\bsell\b|بيع/.test(x)) sells.push(j); });
    const code=cells.findIndex(x => /\bccy\b|currency code|رمز العملة|كود العملة/.test(x));
    if (buy>=0 && sells.length>=1) { headerIndex=i; buyIndex=buy; sellIndexes=sells; codeIndex=code; break; }
  }
  if (headerIndex<0) throw new Error('CBI workbook headers not recognized');
  const sellIndex=sellIndexes[sellIndexes.length-1];
  const rates={};
  for (let i=headerIndex+1;i<rows.length;i++) {
    const row=rows[i]||[]; let code=codeIndex>=0 ? codeCell(row[codeIndex]) : null;
    if (!code) for (const cell of row) { code=codeCell(cell); if (code) break; }
    if (!code) continue;
    const buy=num(row[buyIndex]), sell=num(row[sellIndex]);
    if (buy && sell) rates[code]={buy,sell,mid:(buy+sell)/2,official:true,source:'CBI'};
  }
  if (Object.keys(rates).length<5) throw new Error('Too few CBI currency rows detected');
  return rates;
}
function findDate(rows) {
  const text=(rows||[]).slice(0,25).flat().map(v=>String(v||'')).join(' ');
  const iso=text.match(/20\d{2}[-/]\d{1,2}[-/]\d{1,2}/); if (iso) return iso[0].replaceAll('/','-');
  const dmy=text.match(/\b(\d{1,2})[/. -](\d{1,2})[/. -](20\d{2})\b/); if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`;
  return null;
}
async function fetchCbi() {
  const page=await fetch(CBI_PAGE,{headers:{'User-Agent':'AlRayyanExchangeCurrencyBot/1.0'}});
  if(!page.ok) throw new Error('CBI page HTTP '+page.status);
  const html=await page.text();
  const candidates=[...html.matchAll(/href=["']([^"']+\.xlsx(?:\?[^"']*)?)["']/gi)].map(m=>new URL(m[1],CBI_PAGE).href);
  if(!candidates.length) throw new Error('No CBI XLSX link was found');
  let lastError;
  for (const url of candidates.slice(0,4)) {
    try {
      const resp=await fetch(url,{headers:{'User-Agent':'AlRayyanExchangeCurrencyBot/1.0'}});
      if(!resp.ok) throw new Error('CBI file HTTP '+resp.status);
      const buf=Buffer.from(await resp.arrayBuffer());
      const wb=XLSX.read(buf,{type:'buffer',cellDates:true});
      let combined={}, latestDate=null;
      for (const sheetName of wb.SheetNames) {
        const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,raw:true,defval:''});
        const parsed=parseRows(rows); combined={...combined,...parsed}; latestDate=latestDate||findDate(rows);
      }
      if(Object.keys(combined).length>=5) return {rates:combined,asOfDate:latestDate,sourceUrl:url};
    } catch(e) { lastError=e; }
  }
  throw lastError || new Error('Unable to parse CBI workbook');
}
async function addFallback(rates) {
  const missing=SUPPORTED.filter(c=>c!=='IQD' && !rates[c]);
  if(!missing.length) return {rates,meta:null};
  try {
    const r=await fetch(GLOBAL_URL,{headers:{'Accept':'application/json'}});
    if(!r.ok) throw new Error('Global provider HTTP '+r.status);
    const data=await r.json();
    const iq=Number(data?.rates?.IQD);
    if(!iq) throw new Error('Global provider did not return IQD');
    for(const code of missing) {
      const perUsd=Number(data?.rates?.[code]);
      if(perUsd>0) rates[code]={buy:null,sell:null,mid:iq/perUsd,official:false,source:'ExchangeRate.dev',dataUpdatedAt:data?.effective_at?.[code]||data?.data_updated_at||data?.timestamp};
    }
    return {rates,meta:{source:'ExchangeRate.dev',sourceUrl:'https://exchangerate.dev/',dataUpdatedAt:data?.data_updated_at||data?.timestamp,notice:data?.notice||'Indicative rates, not for settlement.'}};
  } catch(e) { return {rates,meta:{source:'ExchangeRate.dev',sourceUrl:'https://exchangerate.dev/',error:e.message}}; }
}
module.exports = async function handler(req,res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=1800');
  res.setHeader('X-Content-Type-Options','nosniff');
  try {
    let official, asOfDate, officialUrl, status='live', fetchedAt=new Date().toISOString();
    try { const cbi=await fetchCbi(); official=cbi.rates; asOfDate=cbi.asOfDate; officialUrl=cbi.sourceUrl; }
    catch(e) { official={}; status='stale'; }
    if(!official || Object.keys(official).length<5) {
      official={};
      for(const [code,row] of Object.entries(SNAPSHOT.rates)) if(row.official) official[code]=row;
      asOfDate=SNAPSHOT.asOfDate; officialUrl=SNAPSHOT.officialSourceUrl; fetchedAt=SNAPSHOT.fetchedAt;
    }
    official.IQD={buy:1,sell:1,mid:1,official:true,source:'CBI'};
    const enriched=await addFallback(official);
    const output={schemaVersion:1,status,baseCurrency:'IQD',asOfDate:asOfDate||null,fetchedAt,officialSource:'Central Bank of Iraq',officialSourceUrl:officialUrl||CBI_LANDING,officialLandingUrl:CBI_LANDING,fallbackSource:'ExchangeRate.dev',fallbackSourceUrl:'https://exchangerate.dev/',fallbackMeta:enriched.meta,rates:enriched.rates,note:'CBI bulletin rates are indicative and do not constitute an obligation on the Central Bank of Iraq.'};
    return res.status(200).json(output);
  } catch(e) {
    const fallback={...SNAPSHOT,status:'snapshot',error:'Live source retrieval failed'};
    return res.status(200).json(fallback);
  }
};
