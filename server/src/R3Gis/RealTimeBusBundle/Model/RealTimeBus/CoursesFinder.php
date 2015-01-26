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
class CoursesFinder {

    private $connection;

    public function __construct(Connection $connection) {
        $this->connection = $connection;
    }

    public function getCourses(array $stopId, $limit = null) {

        $limitSql = '';
        if (!is_null($limit)) {
            $limitSql = "LIMIT $limit";
        }
        $selectStops = <<<EOQ
SELECT
    rec_lid.lidname,
    rec_frt.frt_fid,
    vdv.vdv_seconds_to_hhmm(frt_start + COALESCE(travel_time, 0) + COALESCE(delay_sec, 0)) AS bus_passes_at,
    COALESCE(delay_sec, 0)/60 AS delay_minutes,
    mta.tagesart_text,
    fahrtart_nr,
    li_r,
    li_g,
    li_b
FROM vdv.lid_verlauf
INNER JOIN vdv.rec_lid
    ON lid_verlauf.li_nr = rec_lid.li_nr
    AND lid_verlauf.str_li_var = rec_lid.str_li_var
INNER JOIN vdv.rec_frt
    ON rec_lid.li_nr = rec_frt.li_nr
    AND rec_lid.str_li_var = rec_frt.str_li_var
LEFT JOIN vdv.travel_times
    ON travel_times.frt_fid=rec_frt.frt_fid
    AND travel_times.li_lfd_nr_start=1
    AND travel_times.li_lfd_nr_end=lid_verlauf.li_lfd_nr
LEFT JOIN vdv.vehicle_position_act
    ON vehicle_position_act.frt_fid=rec_frt.teq_nummer
LEFT JOIN vdv.menge_tagesart mta
    ON rec_frt.tagesart_nr=mta.tagesart_nr
LEFT JOIN vdv.firmenkalender fkal
    ON rec_frt.tagesart_nr=fkal.tagesart_nr
LEFT JOIN vdv.line_attributes
    ON rec_frt.li_nr=line_attributes.li_nr
WHERE ort_nr={$stopId['ort_nr']}
    AND onr_typ_nr={$stopId['onr_typ_nr']}
    AND betriebstag=to_char(CURRENT_TIMESTAMP, 'YYYYMMDD')::integer
    AND frt_start > EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CURRENT_DATE))
ORDER BY bus_passes_at
$limitSql
EOQ;

/*
    AND frt_start > date_part('hour', CURRENT_TIMESTAMP) * 3600 +
    date_part('minute', CURRENT_TIMESTAMP) * 60 +
    date_part('second', CURRENT_TIMESTAMP)

 */    
        $res = $this->connection->query($selectStops);
        $courses = array();
        while ($row = $res->fetch(\PDO::FETCH_ASSOC)) {
            $courses[] = $row;
        }
        return $courses;
    }

}
