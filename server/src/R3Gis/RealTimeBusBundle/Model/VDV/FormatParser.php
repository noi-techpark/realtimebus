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

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */

class FormatParser {

    public function parseFormat($format) {
        $formatDef = array();
        if (substr($format, 0, 3) == 'num') {
            $formatDef["type"] = 'num';
            if (preg_match('/num\[(\d+)\.(\d+)\]/', $format, $matches)) {
                $formatDef["width"] = $matches[1];
                $formatDef["scale"] = $matches[2];
            } else {
                throw new Exception\FileFormatException("Unknown width and scale format '$format'");
            }
        } else if (substr($format, 0, 4) == 'char') {
            $formatDef["type"] = 'char';
            if (preg_match('/char\[(\d+)\]/', $format, $matches)) {
                $formatDef["width"] = $matches[1];
            } else {
                throw new Exception\FileFormatException("Unknown width in format '$format'");
            }
        } else {
            throw new Exception\FileFormatException("Unknown data type in format '$format'");
        }
        return $formatDef;
    }

    public function parseAttributeDefs($atrLine, $frmLine) {
        $attributes = explode(';', $atrLine);
        $formats = explode(';', $frmLine);
        if (count($attributes) != count($formats)) {
            throw new Exception("Error in header of {$this->filePath}, number of attributes differs from number of formats");
        }

        $attrDefs = array();
        foreach ($attributes as $i => $attribute) {
            $attrDefs[trim($attribute)] = $this->parseFormat(trim($formats[$i]));
        }
        return $attrDefs;
    }

    public function parseRecord(array $attrDefs, $record) {
        if (substr($record, 0, 4) != 'rec;') {
            throw new Exception\FileFormatException("data records must start with 'rec;'");
        }
        $position = 3;
        $data = array();
        foreach ($attrDefs as $attName => $attFormat) {
            $position += 2; // skip the semicolon and the following white space
            $isQuoted = false;
            if ($record[$position] == '"') {
                if ($record[$position + $attFormat['width'] + 1] == '"') {
                    $isQuoted = true;
                    $position += 1; // skip the opening quote
                }
            }
            $data[$attName] = substr($record, $position, $attFormat['width']);
            $position += $attFormat['width'];
            if ($isQuoted) {
                $position += 1;  // skip the closing quote
            }
        }
        return $data;
    }

}