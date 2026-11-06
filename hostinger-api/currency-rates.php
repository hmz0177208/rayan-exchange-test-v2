<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('X-Content-Type-Options: nosniff');
$file=dirname(__DIR__).'/data/currency-rates.json';
if(!is_file($file)){http_response_code(503);echo json_encode(['error'=>'Rates cache is not initialized','rates'=>[]]);exit;}
$body=file_get_contents($file);
if($body===false || json_decode($body,true)===null){http_response_code(503);echo json_encode(['error'=>'Rates cache is invalid','rates'=>[]]);exit;}
echo $body;
?>