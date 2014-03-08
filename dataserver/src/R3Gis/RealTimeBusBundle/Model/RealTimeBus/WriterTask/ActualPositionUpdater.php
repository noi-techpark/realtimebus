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

namespace R3Gis\RealTimeBusBundle\Model\RealTimeBus\WriterTask;

use Doctrine\DBAL\Connection;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\DataFilter;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\TimeTableUtils;

class ActualPositionUpdater implements Executable {

    private $db;

    public function __construct(Connection $db) {
        $this->db = $db;
    }

    private function insertTravelTimes($frtFid) {

        $deleteOldSql = "DELETE FROM vdv.travel_times WHERE frt_fid=$frtFid";
        $this->db->exec($deleteOldSql);

        $timeTableUtils = new TimeTableUtils($this->db);
        $timeTableUtils->insertTravelTimes($frtFid);
    }

    public function execute($featureId, array $feature, $filterValue) {
        if ($filterValue != DataFilter::IS_OK) {
            return;
        }
        
        if (empty($feature['properties']['frt_fid'])) {
            return;
        }
        // do not copy data, if it is an internal course
        $isInternalCourseSql = <<<EOQ
SELECT str_li_var
FROM vdv.rec_frt
WHERE frt_fid = {$feature['properties']['frt_fid']}
EOQ;
        $strLiVar = $this->db->query($isInternalCourseSql)->fetchColumn();
        if ($strLiVar >= 990) {
            // exclude Betriebsfahrten
            return;
        }

        $frtExistsSql = <<<EOQ
SELECT COUNT(*) FROM vdv.vehicle_position_act
WHERE frt_fid={$feature['properties']['frt_fid']}
EOQ;
        $frtExists = $this->db->query($frtExistsSql)->fetchColumn();

        // insert into table with actual data
        if ($frtExists) {
            $mergeNewPos = <<<EOQ
UPDATE vdv.vehicle_position_act SET
    gps_date  = '{$feature['properties']['gps_date']}',
    delay_sec = {$feature['properties']['delay_sec']},
    li_nr = {$feature['properties']['li_nr']},
    str_li_var = '{$feature['properties']['str_li_var']}',
    li_lfd_nr = {$feature['properties']['li_lfd_nr']},
    interpolation_distance = {$feature['properties']['interpolation_distance']},
    interpolation_linear_ref = {$feature['properties']['interpolation_linear_ref']},
    the_geom  = {$feature['geometry_sql']}
WHERE frt_fid=$featureId
EOQ;
        } else {
            $mergeNewPos = <<<EOQ
INSERT INTO vdv.vehicle_position_act
    (gps_date,
    delay_sec,
    frt_fid,
    li_nr,
    str_li_var,
    li_lfd_nr,
    interpolation_distance,
    interpolation_linear_ref,
    the_geom)
VALUES (
    '{$feature['properties']['gps_date']}',
    {$feature['properties']['delay_sec']},
    {$feature['properties']['frt_fid']},
    {$feature['properties']['li_nr']},
    '{$feature['properties']['str_li_var']}',
    {$feature['properties']['li_lfd_nr']},
    {$feature['properties']['interpolation_distance']},
    {$feature['properties']['interpolation_linear_ref']},
    {$feature['geometry_sql']})
EOQ;
        }
        $this->db->exec($mergeNewPos);
        
    }

}
