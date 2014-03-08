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

namespace R3Gis\RealTimeBusBundle\Model\Geocoding;


use Symfony\Component\HttpFoundation\Request;
use Doctrine\DBAL\Connection;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\LinesUtils;

/**
 * @author Francesco D'Alesio <francesco.dalesio@r3-gis.com>
 */
class Geocoder {
    private $connection;
    private $lines;
    
    public function __construct(Connection $connection) {
        $this->connection = $connection;
    }
    
    public function setLines(array $lines) {
        $this->lines = $lines;
    }
    
    public function find(Request $request) {
        $results = array();
        
        $query = $request->get('query');
        if(stripos($query, 'bz') === false) {
            $address = $query . ' BZ';
        } else {
            $address = $query;
        }
        
        $distance = $request->get('distance');
        if(empty($distance)) $distance = 1000;
        
        $whereLines = '';
        if (!is_null($this->lines)) {
            // $lines was set explicitely, otherwise everthing is accepted
            if (count($this->lines) == 0) {
                // 0 lines set
                return array();
            }
            $whereLines = "    AND (".LinesUtils::whereLines('lid_verlauf.li_nr', 'lid_verlauf.str_li_var', $this->lines).")";
        }
        
        $url = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&region=it&address='.urlencode($address);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $jsonString = curl_exec($ch);
        curl_close($ch);
        
        if($jsonString) {
            try {
                $json = json_decode($jsonString, true);
                if($json['status'] == 'OK') {
                    foreach($json['results'] as $result) {
                        array_push($results, array(
                            'type'=>'location',
                            'name'=>$result['formatted_address'],
                            'srid'=>'EPSG:4326',
                            'lat'=>$result['geometry']['location']['lat'],
                            'lon'=>$result['geometry']['location']['lng']
                        ));
                    }
                }
            } catch(Exception $e) {
            }
            
            $validResults = array();
            foreach($results as &$result) {
                if($result['lat'] > 48 || $result['lat'] < 46) continue;
                if($result['lon'] > 13 || $result['lon'] < 10) continue;
                $sql = 'select 
                    rec_ort.ort_nr, rec_ort.onr_typ_nr, ort_name as name, st_x(rec_ort.the_geom) as lon, st_y(rec_ort.the_geom) as lat 
                    from vdv.rec_ort 
                    INNER JOIN vdv.lid_verlauf
                        ON lid_verlauf.ort_nr=rec_ort.ort_nr
                        AND lid_verlauf.onr_typ_nr=rec_ort.onr_typ_nr
                    where st_intersects(rec_ort.the_geom, st_buffer(st_transform(st_geomfromtext(:geom, 4326), 25832), :distance)) 
                    '.$whereLines.'
                    group by rec_ort.onr_typ_nr, rec_ort.ort_nr
                    order by st_distance(rec_ort.the_geom, st_transform(st_geomfromtext(:geom, 4326), 25832))  
                    limit 3';
                try {
                    $stmt = $this->connection->prepare($sql);
                    $stmt->execute(array(
                        'geom'=>'POINT('.$result['lon'].' '.$result['lat'].')',
                        'distance'=>$distance
                    ));
                } catch(Exception $e) {
                    continue;
                }
                $result['stops'] = array();
                while($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($result['stops'], $row);
                }
                if(!empty($result['stops'])) array_push($validResults, $result);
            }
            unset($result);
            $results = $validResults;
        }
        return $results;
    }
}