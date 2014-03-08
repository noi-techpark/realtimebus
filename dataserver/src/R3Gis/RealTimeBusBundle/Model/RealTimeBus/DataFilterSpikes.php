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
class DataFilterSpikes implements DataFilter {

    private $db;
    private $maxSpeed;

    function __construct(Connection $db, $maxSpeed) {
        $this->db = $db;
        $this->maxSpeed = $maxSpeed;
    }
    
    function wktFromGeoArray($jsonArray) {
        // TODO: factor out in separate utility class
        if ($jsonArray['type'] === 'Point') {
            return "POINT({$jsonArray['coordinates'][0]} {$jsonArray['coordinates'][1]})";
        } else {
            throw new \Exception("geometry type [{$jsonArray['type']}]not handled ");
        }
    }

    function filter($table, array $feature, $dataSrid, $dbSrid) {
        // throw new \Exception(var_export($feature, true));
        $t1 = new \DateTime($feature['properties']['gps_date']);
        $filterResult = DataFilter::IS_OK;
        if (!empty($feature['properties']['frt_fid'])) {
            /* TODO:
             * when database in LATLON!!!
    ST_Distance_Sphere(
        the_geom) as gc_distance,
             */
            $wktString = $this->wktFromGeoArray($feature['geometry']);

            $sql = <<<EOQ
SELECT
    frt_fid,
    ST_AsGeoJSON(the_geom) AS json_geom,
    gps_date,
    ST_Distance(
        ST_Transform(
            ST_GeomFromText('$wktString', $dataSrid),
        $dbSrid),
    the_geom) as distance,
    filter
FROM $table
WHERE frt_fid='{$feature['properties']['frt_fid']}'
ORDER BY gps_date DESC
LIMIT 10
EOQ;
            $history = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
            
            /*
            if (count($history) < 5) {
                return;
            } else if (count($history) == 5) {
                
            }
             * 
             */
                    // throw new \Exception($history);
            foreach ($history as $historyPoint) {
                if ($historyPoint['filter'] == 0) {
                    // $previousPosition = json_decode($historyPoint['json_geom'], true);
                    // $d = $this->distance($previousPosition['coordinates'], $feature['geometry']['coordinates']);
                    $t0 = new \DateTime($historyPoint['gps_date']);
                    $s = $t1->getTimestamp() - $t0->getTimestamp();
                    $d = $historyPoint['distance'];
                    // echo $t1->format('Y-m-d H:i:s'). " - ".$t0->format('Y-m-d H:i:s')."=$s\n";

                    if ($s > 0) {
                        $speed = $d / floor($s);
                        // echo "s=$s, v=$speed, d={$historyPoint['gc_distance']}\n";
                        if ($speed > $this->maxSpeed) {
                            $filterResult = 1;
                        }
                    }
                    break;
                }
            }
        }
        return $filterResult;
    }

}