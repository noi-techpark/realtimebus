<?php

require __DIR__ . '/../../../lib/classloader.php';

spl_autoload_register("realtimeBusAutoload");

use RealTimeBus\App;
use VDV\Parser;
use VDV\DBConnector\DataPump;

class DataPumpTest extends PHPUnit_Framework_TestCase {

    function testPump() {
        $app = App::getInstance();
        
        $fileDir = __DIR__ . "/../../samples/452/";
        $sampleFiles = glob($fileDir . "AUSBILDUNG.X10");
        foreach ($sampleFiles as $sampleFile) {
            $parser = new Parser($sampleFile);
            $dataPump = new DataPump();
            echo $dataPump->pumpToDb($app->getDb(), $parser);
            echo "\n\n";
        }
    }

}