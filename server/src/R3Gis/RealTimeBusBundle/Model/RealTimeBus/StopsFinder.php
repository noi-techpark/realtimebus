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
class StopsFinder {

    private $connection;
    private $srid;
    private $lines;

    public function __construct(Connection $connection, $srid) {
        $this->connection = $connection;
        $this->srid = $srid;
    }

    public function setLines($lines) {
        $this->lines = $lines;
    }

    public function getNextStops($frtFid) {
        
        $selectStops = <<<EOQ
SELECT rec_ort.onr_typ_nr,
    lid_verlauf.li_lfd_nr,
    rec_ort.ort_nr,
    rec_ort.ort_name,
    rec_ort.ort_ref_ort_name,
    COALESCE(vpa.delay_sec, 0) delay_sec,
    vdv.vdv_seconds_to_hhmm(frt_start + COALESCE(travel_time, 0) + COALESCE(delay_sec, 0)) AS time_est,
    li_ri_nr,
    ST_AsGeoJSON(rec_ort.the_geom) as json_geom
FROM vdv.vehicle_position_act vpa
INNER JOIN vdv.rec_frt
    ON rec_frt.teq_nummer=vpa.frt_fid
INNER JOIN vdv.rec_lid
    ON rec_frt.li_nr=rec_lid.li_nr
    AND rec_frt.str_li_var=rec_lid.str_li_var
INNER JOIN vdv.lid_verlauf
    ON rec_frt.li_nr=lid_verlauf.li_nr
    AND rec_frt.str_li_var=lid_verlauf.str_li_var
    AND vpa.li_lfd_nr < lid_verlauf.li_lfd_nr
LEFT JOIN vdv.travel_times
    ON lid_verlauf.li_lfd_nr = li_lfd_nr_end
    AND travel_times.frt_fid=rec_frt.frt_fid
LEFT JOIN vdv.rec_ort
    ON lid_verlauf.onr_typ_nr =  rec_ort.onr_typ_nr
    AND lid_verlauf.ort_nr = rec_ort.ort_nr
WHERE rec_frt.frt_fid = $frtFid
ORDER BY time_est
EOQ;
        $res = $this->connection->query($selectStops);
        $featureList = new FeatureList();
        while ($row = $res->fetch(\PDO::FETCH_ASSOC)) {
            $geometry = json_decode($row['json_geom'], true);
            unset($row['json_geom']);
            $featureList->add($row, $geometry);
        }
        return $featureList->getFeatureCollection();
    }

    public function getStops() {
        $selectStops = <<<EOQ
SELECT rec_ort.onr_typ_nr,
    rec_ort.ort_nr,
    rec_ort.ort_name,
    rec_ort.ort_ref_ort_name,
    ST_AsGeoJSON(rec_ort.the_geom) as json_geom
FROM  vdv.rec_ort
EOQ;
        $featureList = new FeatureList();

        if (!is_null($this->lines)) {
            // $lines was set explicitely, otherwise everthing is accepted
            if (count($this->lines) == 0) {
                return $featureList;
            } else {
                // some lines where selected, otherwise return empty FeatureCollection
                $selectStops .= <<<EOQ

INNER JOIN vdv.lid_verlauf
    ON lid_verlauf.ort_nr=rec_ort.ort_nr
    AND lid_verlauf.onr_typ_nr=rec_ort.onr_typ_nr
WHERE             
EOQ;
                $selectStops .= LinesUtils::whereLines('lid_verlauf.li_nr', 'lid_verlauf.str_li_var', $this->lines);
            }
        }
        $res = $this->connection->query($selectStops);
        while ($row = $res->fetch(\PDO::FETCH_ASSOC)) {
            $geometry = json_decode($row['json_geom'], true);
            unset($row['json_geom']);
            $featureList->add($row, $geometry);
        }
        return $featureList->getFeatureCollection();
    }

}
