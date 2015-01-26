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

namespace R3Gis\RealTimeBusBundle\Model\RealTimeBus;

use Doctrine\DBAL\Connection;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class DataFilterFrtExists implements DataFilter {

    private $db;
    private $logger;

    function __construct(Connection $db, $logger) {
        $this->db = $db;
        $this->logger = $logger;
    }

    function filter($table, array $feature, $dataSrid, $dbSrid) {
        $filterResult = 1;
        if (!empty($feature['properties']['frt_fid'])) {
            $frtFid = $this->db->quote($feature['properties']['frt_fid']);
            $sql = "SELECT COUNT(*) FROM vdv.rec_frt WHERE teq_nummer=" . $frtFid;
            $found = $this->db->query($sql)->fetchColumn();
            if ($found) {
                $filterResult = DataFilter::IS_OK;
            }
        }
        
        if ($filterResult !== DataFilter::IS_OK) {
            $this->logger->warning("frt_fid = ({$feature['properties']['frt_fid']}) from real time data is not found in rec_frt");
        }
        return $filterResult;
    }

}