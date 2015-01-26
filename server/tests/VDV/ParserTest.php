<?php

require __DIR__ . '/../../lib/classloader.php';

spl_autoload_register("realtimeBusAutoload");

use VDV\Parser;

class ParserTest extends PHPUnit_Framework_TestCase {

    function testAllFiles() {
        $fileDir = __DIR__ . "/../samples/452/";
        $sampleFiles = glob($fileDir . "*.X10");
        foreach ($sampleFiles as $sampleFile) {
            $parser = new Parser($sampleFile);
            $header = $parser->getHeaders();
            $this->assertTrue(is_array($header));

            $attributeDefs = $parser->getAttributeDefs();
            $this->assertTrue(is_array($attributeDefs));
        }
    }

    function testGetRecords() {
        $filePath = __DIR__ . "/../samples/452/AUSBILDUNG.X10";
        $parser = new Parser($filePath);
        foreach($parser as $i => $record) {
        }
        foreach($parser as $i => $record) {
        }
    }

}