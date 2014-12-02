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

use Doctrine\DBAL\Driver\Connection;
use R3Gis\RealTimeBusBundle\Model\VDV\DBConnector\TableCreator;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class DirSchemaImport {

    private $conn;
    private $logger;

    public function __construct(Connection $conn, $logger) {
        $this->conn = $conn;
        $this->logger = $logger;
    }

    public function execute($vdvFilesDir, array $tables) {

        foreach ($tables as $importTable) {
            $this->logger->debug("$importTable");
            $file = "{$vdvFilesDir}{$importTable}.X10";
            if (!file_exists($file)) {
                throw new \Exception("Could not find file $file");
            }

            $parser = new Parser($file);
            $tableCreator = new TableCreator();
            echo $tableCreator->getCreateTable($parser);
        }
    }

}
