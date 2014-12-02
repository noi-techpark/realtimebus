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
use Doctrine\DBAL\Connection;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class DataPump {

    private $sourceCharset = 'ISO-8859-1';
    private $targetCharset = 'UTF-8';

    public function pumpToDb(Connection $db, Parser $parser) {
        $tableName = strtolower(trim($parser->getHeader('tbl')));
        $attrDefs = $parser->getAttributeDefs();

        $recordsPumped = 0;
        $sql = "INSERT INTO " . strtolower($tableName) . " (\n";
        $isFirst = true;
        foreach ($attrDefs as $attrName => $attrDef) {
            if ($isFirst) {
                $isFirst = false;
            } else {
                $sql .= ",\n";
            }
            $sql .= "    " . strtolower(trim($attrName));
        }
        $sql .= "\n) VALUES (\n%s\n);\n";

        foreach ($parser as $record) {
            $values = array();
            foreach ($attrDefs as $attrName => $attrDef) {
                if (trim($record[$attrName]) === '') {
                    $values[] = 'NULL';
                } else if ($attrDef['type'] == 'char') {
                    $values[] = $db->quote(
                            iconv($this->sourceCharset, $this->targetCharset, trim($record[$attrName])
                            )
                    );
                } else {
                    $values[] = trim($record[$attrName]);
                }
            }
            $valuesStr = "    " . implode(",\n    ", $values);
            $recordsPumped++;
            $insertSql = sprintf($sql, $valuesStr);
            // echo $insertSql;
            $db->exec($insertSql);
        }
        return $recordsPumped;
    }

}
