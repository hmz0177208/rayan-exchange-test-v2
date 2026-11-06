<?php
/* Run this file from CLI via Hostinger Cron Jobs; browser requests are denied. */
const CBI_PAGE_URL = 'https://cbi.iq/page/144';
const GLOBAL_RATES_URL = 'https://api.exchangerate.dev/v1/latest/USD';
const SUPPORTED_CODES = ["IQD", "USD", "EUR", "TRY", "JOD", "GBP", "AED", "SAR", "KWD", "QAR", "OMR", "BHD", "EGP", "LBP", "CAD", "CHF", "SEK", "NOK", "DKK", "JPY", "CNY", "AUD", "INR", "PKR", "RUB", "MAD", "TND", "ZAR", "SGD", "MYR", "THB", "NZD", "KRW", "IDR", "PLN", "CZK", "HUF", "UAH", "PHP", "HKD", "BRL", "MXN", "ILS", "LKR", "NPR", "AFN", "IRR", "NGN"];
$root = dirname(__DIR__);
$dataFile = $root . '/data/currency-rates.json';
$logFile = $root . '/data/currency-rates-update.log';
function logLine($message) { global $logFile; file_put_contents($logFile, '['.gmdate('c').'] '.$message.PHP_EOL, FILE_APPEND | LOCK_EX); }
function fetchUrl($url) {
  if (function_exists('curl_init')) {
    $ch=curl_init($url);
    curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_TIMEOUT=>25,CURLOPT_USERAGENT=>'AlRayyanExchangeCurrencyBot/1.0']);
    $body=curl_exec($ch); $status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE); $err=curl_error($ch); curl_close($ch);
    if($body===false || $status<200 || $status>=300) throw new RuntimeException('HTTP fetch failed '.$status.' '.$err);
    return $body;
  }
  $ctx=stream_context_create(['http'=>['timeout'=>25,'follow_location'=>1,'header'=>"User-Agent: AlRayyanExchangeCurrencyBot/1.0\r\n"],'ssl'=>['verify_peer'=>true,'verify_peer_name'=>true]]);
  $body=@file_get_contents($url,false,$ctx); if($body===false) throw new RuntimeException('Unable to fetch URL'); return $body;
}
function colIndexFromRef($ref) { preg_match('/^[A-Z]+/',strtoupper($ref),$m); $n=0; foreach(str_split($m[0]??'A') as $c) $n=$n*26+(ord($c)-64); return $n-1; }
function readXlsxRows($file) {
  if(!class_exists('ZipArchive') || !class_exists('DOMDocument')) throw new RuntimeException('Enable PHP ZipArchive and DOM extensions in Hostinger.');
  $zip=new ZipArchive(); if($zip->open($file)!==true) throw new RuntimeException('Cannot open CBI XLSX file.');
  $strings=[]; $shared=$zip->getFromName('xl/sharedStrings.xml');
  if($shared!==false) { $d=new DOMDocument(); if($d->loadXML($shared,LIBXML_NONET|LIBXML_NOBLANKS)) foreach($d->getElementsByTagName('si') as $si){$txt='';foreach($si->getElementsByTagName('t') as $t)$txt.=$t->textContent;$strings[]=$txt;} }
  $sheetNames=[]; for($i=0;$i<$zip->numFiles;$i++){ $n=$zip->getNameIndex($i); if(preg_match('#^xl/worksheets/sheet\d+\.xml$#',$n))$sheetNames[]=$n; }
  $all=[];
  foreach($sheetNames as $sheetName){
    $xml=$zip->getFromName($sheetName); if($xml===false)continue;
    $d=new DOMDocument(); if(!$d->loadXML($xml,LIBXML_NONET|LIBXML_NOBLANKS))continue;
    $rows=[];
    foreach($d->getElementsByTagName('row') as $rowNode){
      $row=[];
      foreach($rowNode->getElementsByTagName('c') as $cell){
        $idx=colIndexFromRef($cell->getAttribute('r')); $v=''; $vn=$cell->getElementsByTagName('v');
        if($vn->length){$v=$vn->item(0)->textContent;if($cell->getAttribute('t')==='s')$v=$strings[(int)$v]??'';}
        else{$tn=$cell->getElementsByTagName('t');if($tn->length)$v=$tn->item(0)->textContent;}
        $row[$idx]=$v;
      }
      if($row){$max=max(array_keys($row));$line=array_fill(0,$max+1,'');foreach($row as $k=>$v)$line[$k]=$v;$rows[]=$line;}
    }
    $all[]=$rows;
  }
  $zip->close(); return $all;
}
function toNumber($v){if($v===null||$v==='')return null;$s=str_replace([',','٬',' '],['','',''],(string)$v);$s=str_replace('٫','.',$s);return is_numeric($s)&&floatval($s)>0?floatval($s):null;}
function detectCbiRates($sheets) {
  $out=[]; $date=null;
  foreach($sheets as $rows){
    $header=-1;$buy=-1;$sells=[];$codeCol=-1;
    for($i=0;$i<min(40,count($rows));$i++){
      $cells=array_map(fn($v)=>(function_exists('mb_strtolower')?mb_strtolower(trim((string)$v),'UTF-8'):strtolower(trim((string)$v))),$rows[$i]);$bi=-1;$ss=[];$ci=-1;
      foreach($cells as $j=>$v){if($bi<0&&(str_contains($v,'buy')||str_contains($v,'شراء')))$bi=$j;if(str_contains($v,'sell')||str_contains($v,'بيع'))$ss[]=$j;if(str_contains($v,'ccy')||str_contains($v,'currency code')||str_contains($v,'رمز العملة')||str_contains($v,'كود العملة'))$ci=$j;}
      if($bi>=0&&count($ss)>=1){$header=$i;$buy=$bi;$sells=$ss;$codeCol=$ci;break;}
    }
    if($header<0)continue; $sell=end($sells);
    for($i=$header+1;$i<count($rows);$i++){
      $row=$rows[$i];$code=$codeCol>=0?strtoupper(trim((string)($row[$codeCol]??''))):'';
      if(!in_array($code,SUPPORTED_CODES,true)){foreach($row as $cell){$candidate=strtoupper(trim((string)$cell));if(preg_match('/^[A-Z]{3}$/',$candidate)&&in_array($candidate,SUPPORTED_CODES,true)){$code=$candidate;break;}}}
      if(!$code)continue;$b=toNumber($row[$buy]??null);$s=toNumber($row[$sell]??null);if($b&&$s)$out[$code]=['buy'=>$b,'sell'=>$s,'mid'=>($b+$s)/2,'official'=>true,'source'=>'CBI'];
    }
    if(!$date){$text=implode(' ',array_merge(...array_slice($rows,0,25)));if(preg_match('/(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})/',$text,$m))$date=sprintf('%04d-%02d-%02d',$m[1],$m[2],$m[3]);elseif(preg_match('/\b(\d{1,2})[.\/ -](\d{1,2})[.\/ -](20\d{2})\b/',$text,$m))$date=sprintf('%04d-%02d-%02d',$m[3],$m[2],$m[1]);}
  }
  if(count($out)<5)throw new RuntimeException('CBI workbook structure was not recognized or had too few currency rows.');
  $out['IQD']=['buy'=>1,'sell'=>1,'mid'=>1,'official'=>true,'source'=>'CBI']; return [$out,$date];
}
function updateRates(){
  global $dataFile;
  $page=fetchUrl(CBI_PAGE_URL);
  preg_match_all('/href=["\']([^"\']+\.xlsx(?:\?[^"\']*)?)["\']/i',$page,$matches);
  $urls=[];foreach($matches[1]??[] as $u){$urls[]=preg_match('#^https?://#i',$u)?$u:'https://cbi.iq/'.ltrim($u,'/');}
  if(!$urls)throw new RuntimeException('No official CBI XLSX link found.');
  $last=null;$rates=null;$asOf=null;$used=null;$tmp=sys_get_temp_dir().'/cbi_rates_'.uniqid().'.xlsx';
  foreach(array_slice($urls,0,4) as $url){try{$bytes=fetchUrl($url);if(strlen($bytes)<500)throw new RuntimeException('CBI workbook is too small.');file_put_contents($tmp,$bytes);[$parsed,$date]=detectCbiRates(readXlsxRows($tmp));$rates=$parsed;$asOf=$date;$used=$url;break;}catch(Throwable $e){$last=$e->getMessage();}}
  @unlink($tmp);if(!$rates)throw new RuntimeException($last?:'CBI XLSX parsing failed.');
  $fallbackMeta=null;
  try{$global=json_decode(fetchUrl(GLOBAL_RATES_URL),true,512,JSON_THROW_ON_ERROR);$usdIqd=floatval($global['rates']['IQD']??0);if($usdIqd>0){foreach(SUPPORTED_CODES as $code){if($code==='IQD'||isset($rates[$code]))continue;$perUsd=floatval($global['rates'][$code]??0);if($perUsd>0)$rates[$code]=['buy'=>null,'sell'=>null,'mid'=>$usdIqd/$perUsd,'official'=>false,'source'=>'ExchangeRate.dev','dataUpdatedAt'=>$global['effective_at'][$code]??$global['data_updated_at']??$global['timestamp']??null];}$fallbackMeta=['source'=>'ExchangeRate.dev','sourceUrl'=>'https://exchangerate.dev/','dataUpdatedAt'=>$global['data_updated_at']??$global['timestamp']??null,'notice'=>$global['notice']??'Indicative rates, not for settlement.'];}}
  catch(Throwable $e){$fallbackMeta=['source'=>'ExchangeRate.dev','sourceUrl'=>'https://exchangerate.dev/','error'=>$e->getMessage()];}
  $payload=['schemaVersion'=>1,'status'=>'live','baseCurrency'=>'IQD','asOfDate'=>$asOf,'fetchedAt'=>gmdate('c'),'officialSource'=>'Central Bank of Iraq','officialSourceUrl'=>$used,'officialLandingUrl'=>CBI_PAGE_URL,'fallbackSource'=>'ExchangeRate.dev','fallbackSourceUrl'=>'https://exchangerate.dev/','fallbackMeta'=>$fallbackMeta,'rates'=>$rates,'note'=>'CBI bulletin rates are indicative and do not constitute an obligation on the Central Bank of Iraq.'];
  $tmpData=$dataFile.'.tmp';if(file_put_contents($tmpData,json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR),LOCK_EX)===false)throw new RuntimeException('Unable to write rates cache.');rename($tmpData,$dataFile);
  logLine('Updated from '.$used.'; CBI rates='.count(array_filter($rates,fn($r)=>($r['official']??false)===true)).'; date='.($asOf??'not detected'));return $payload;
}
if(PHP_SAPI!=='cli'){http_response_code(403);exit('CLI only');}
try{$data=updateRates();echo 'OK '.($data['asOfDate']??'date-not-detected').' '.count($data['rates']).PHP_EOL;}catch(Throwable $e){logLine('ERROR '.$e->getMessage());fwrite(STDERR,'ERROR '.$e->getMessage().PHP_EOL);exit(1);}
?>