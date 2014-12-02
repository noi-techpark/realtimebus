<?php
/*
Real Time Bus
VDV Import

Copyright (C) 2013 TIS Innovation Park - Bolzano/Bozen - Italy

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
namespace R3Gis\RealTimeBusBundle\Model\VDV;

use R3Gis\RealTimeBusBundle\Model\VDV\FormatParser;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class Parser implements \Iterator {

    private $filePath;
    private $fh;
    private $header;
    private $attrDefs;
    private $startData;
    private $currentRecordNr;
    private $currentLine;
    private $isValid;
    private $formatParser;

    public function __construct($filePath) {
        $this->filePath = $filePath;
    }

    private function open() {
        if (($this->fh = fopen($this->filePath, 'r')) === false) {
            throw new \Exception("Could not open {$this->filePath}");
        }
    }

    private function readHeader() {
        if (is_null($this->fh)) {
            $this->open();
        }
        fseek($this->fh, 0);

        $this->header = array();
        $lastPos = 0;
        while ($line = fgets($this->fh)) {
            if (substr($line, 0, 3) == 'rec') {
                $this->startData = $lastPos;
                break;
            }
            $this->header[substr($line, 0, 3)] = trim(substr($line, 4));
            $lastPos = ftell($this->fh);
        }
        if (isset($this->header['atr']) && isset($this->header['frm'])) {
            $this->formatParser = new FormatParser();
            $this->attrDefs = $this->formatParser->parseAttributeDefs($this->header['atr'], $this->header['frm']);
        }
    }

    public function getHeaders() {
        if (is_null($this->header)) {
            $this->readHeader();
        }
        return $this->header;
    }

    public function getHeader($headerPart) {
        if (is_null($this->header)) {
            $this->readHeader();
        }
        if (array_key_exists($headerPart, $this->header)) {
            return $this->header[$headerPart];
        } else {
            throw new \OutOfBoundsException("headers has no line for key '$headerPart'");
        }
        return $this->header;
    }
    
    public function getAttributeDefs() {
        if (is_null($this->header)) {
            $this->readHeader();
        }
        return $this->attrDefs;
    }

    public function current() {
        // return $this->formatParser->parseRecord($this->attrDefs, $this->currentLine);
        $values = str_getcsv(substr($this->currentLine, 4), '; ');
        $retval = array();
        // var_dump($this->attrDefs);
        // var_dump($values);
        $i = 0;
        foreach($this->attrDefs as $key => $frm) {
            $retval[$key] = isset($values[$i])?$values[$i]:null;
            $i++;
        }
        // var_dump($retval);
        
        return $retval;
    }

    public function key() {
        return $this->currentRecordNr;
    }

    public function next() {
        $endReached = true;
        if (!feof($this->fh)) {
            $currentLine = fgets($this->fh);
            if (substr($currentLine, 0, 3) != 'end') {
                $endReached = false;
            }
        }
        if (!$endReached) {
            $this->currentLine = $currentLine;
            $this->currentRecordNr++;
            $this->isValid = true;
        } else {
            fclose($this->fh);
            $this->fh = null;
            $this->isValid = false;
        }
    }

    public function rewind() {
        if (is_null($this->fh)) {
            $this->readHeader();
        }
        fseek($this->fh, $this->startData);
        $this->currentRecordNr = -1;
        $this->next();
    }

    public function valid() {
        return $this->isValid;
    }

}