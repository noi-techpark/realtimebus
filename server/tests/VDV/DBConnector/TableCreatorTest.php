<?php

require __DIR__ . '/../../../lib/classloader.php';

spl_autoload_register("realtimeBusAutoload");

use VDV\Parser;
use VDV\DBConnector\TableCreator;

class TableCreatorTest extends PHPUnit_Framework_TestCase {

    function testAllFiles() {
        $fileDir = __DIR__ . "/../../samples/452/";
        $sampleFiles = glob($fileDir . "*.X10");
        foreach ($sampleFiles as $sampleFile) {
            $parser = new Parser($sampleFile);
            $tableCreator = new TableCreator();
            echo $tableCreator->getCreateTable($parser);
            echo "\n\n";
        }
    }

}