<?php

require __DIR__.'/../../lib/classloader.php';

spl_autoload_register("realtimeBusAutoload");

use VDV\FormatParser;
use VDV\Exception\FileFormatException;

class FormatParserTest extends PHPUnit_Framework_TestCase {

    public function testParseChar() {
        $formatParser = new FormatParser();
        $charFormat = $formatParser->parseFormat('char[10]');
        $this->assertEquals($charFormat, array("type" => "char", "width" => 10));
    }

    public function testParseNum() {
        $formatParser = new FormatParser();
        $charFormat = $formatParser->parseFormat('num[10.1]');
        $this->assertEquals($charFormat, array("type" => "num", "width" => 10, "scale" => 1));
    }

    /**
     * @expectedException VDV\Exception\FileFormatException
     */
    public function testInvalidType() {
        $formatParser = new FormatParser();
        $formatParser->parseFormat('float[10.1]');
    }

    /**
     * @expectedException VDV\Exception\FileFormatException
     */
    public function testInvalidWidth() {
        $formatParser = new FormatParser();
        $formatParser->parseFormat('num[10,1]');
    }
    
    public function testParseAttributeDefs() {
        $atrLine = " BASIS_VERSION; ONR_TYP_NR; ORT_NR; ORT_NAME";
        $frmLine = " num[9.0]; num[2.0]; num[9.0]; char[40]";
        $formatParser = new FormatParser();
        $attributeDefs = $formatParser->parseAttributeDefs($atrLine, $frmLine);
        $this->assertEquals(count($attributeDefs), 4);
    }
}