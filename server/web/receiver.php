<?php

require '../lib/classloader.php';
spl_autoload_register("realtimeBusAutoload");

use RealTimeBus\App;
use RealTimeBus\DataWriter;
use RealTimeBus\DataFilterSpikes;
use RealTimeBus\FeatureList;

$app = App::getInstance();

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo "POST!!!";
    exit(0);
}
$response = array();
$response['status_code'] = 200;
$response['status_text'] = 'OK';

$jsonBody = file_get_contents('php://input');

$impexp = $app->getParam('impexp');
$srid = $impexp['srid'];
$general = $app->getParam('general');
$maxSpeed = $general['max_speed'];

try {
    $featureList = FeatureList::createFromGeoJSON($jsonBody);
    $dataWriter = new DataWriter($app->getDb());
    $dataWriter->addFilter(new DataFilterSpikes($app->getDb(), $maxSpeed));
    $dataWriter->write('temp.vehicle_track_received', $featureList->getFeatures(), $srid);
    $response['body'] = "Data written";
} catch (Exception $e) {
    $response['status_code'] = 450;
    $response['status_text'] = 'BODY_NOT_JSON';
    $response['body'] = $e->getMessage();
}

header("HTTP/1.0 {$response['status_code']} {$response['status_text']}");

echo $response['body'];
