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
namespace R3Gis\RealTimeBusBundle\Model\VDV\DBConnector;

use R3Gis\RealTimeBusBundle\Model\VDV\Parser;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class TableCreator {

    public function getCreateTable(Parser $parser) {
        $tableName = strtolower(trim($parser->getHeader('tbl')));

        $sql = "\n-- DROP TABLE IF EXISTS " . strtolower($tableName) . ";\n";
        $sql .= "CREATE TABLE " . strtolower($tableName) . " (\n";
        $attrDefs = $parser->getAttributeDefs();
        $isFirst = true;
        foreach ($attrDefs as $attrName => $attrDef) {
            if ($isFirst) {
                $isFirst = false;
            } else {
                $sql .= ",\n";
            }
            if ($attrDef['type'] == 'char') {
                if ($attrDef['width'] <= 4) {
                    $dataType = "CHAR({$attrDef['width']})";
                } else {
                    $dataType = "VARCHAR({$attrDef['width']})";
                }
            } else if ($attrDef['type'] == 'num') {
                if ($attrDef['scale'] == 0) {
                    if ($attrDef['width'] <= 4) {
                        $dataType = 'SMALLINT';
                    } else if ($attrDef['width'] <= 9) {
                        $dataType = 'INT';
                    } else if ($attrDef['width'] <= 18) {
                        $dataType = 'BIGINT';
                    } else {
                        $dataType = "DECIMAL({$attrDef['width']})";
                    }
                } else {
                    $dataType = "DECIMAL({$attrDef['width']}, {$attrDef['scale']})";
                }
            } else {
                throw new \DomainException("Unknown type '{$attrDef['type']}'");
            }

            $sql .= "    " . strtolower(trim($attrName)) . " $dataType";
        }
        $sql .= "\n);";
        return $sql;
    }

}
