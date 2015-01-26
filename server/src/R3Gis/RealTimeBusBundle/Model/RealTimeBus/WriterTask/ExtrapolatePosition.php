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

class ExtrapolatePosition implements Executable {

    private $db;

    public function __construct(Connection $db) {
        $this->db = $db;
    }

    public function execute($featureId, array $feature, $filterValue) {
        if ($filterValue != DataFilter::IS_OK) {
            return;
        }

        $getLineSegmentSql = <<<EOQ
SELECT
    vehicle_position_act.frt_fid,
    lid_verlauf.li_nr,
    lid_verlauf.str_li_var,
    lid_verlauf.li_lfd_nr,
    ST_Distance(lid_verlauf.the_geom, vehicle_position_act.the_geom) as interpolation_distance,
    ST_Line_Locate_Point(lid_verlauf.the_geom, vehicle_position_act.the_geom) as interpolation_linear_ref
FROM vdv.vehicle_position_act
INNER JOIN vdv.rec_frt ON vehicle_position_act.frt_fid=rec_frt.frt_fid
INNER JOIN vdv.lid_verlauf ON rec_frt.li_nr=lid_verlauf.li_nr AND rec_frt.str_li_var=lid_verlauf.str_li_var
WHERE vehicle_position_act.frt_fid={$feature['properties']['frt_fid']}
ORDER BY ST_Distance(lid_verlauf.the_geom, vehicle_position_act.the_geom)
LIMIT 1
EOQ;
        // echo $getLineSegmentSql;
        $data = $this->db->query($getLineSegmentSql)->fetchAll(\PDO::FETCH_ASSOC);
        var_dump($data);
        if (count($data) > 0) {
            if (is_null($data[0]['interpolation_linear_ref'])) {
                $data[0]['interpolation_linear_ref'] = 'NULL';
            }
            $setLineSegmentSql = <<<EOQ
UPDATE vdv.vehicle_position_act
SET li_nr={$data[0]['li_nr']},
    str_li_var='{$data[0]['str_li_var']}',
    li_lfd_nr={$data[0]['li_lfd_nr']},
    interpolation_distance={$data[0]['interpolation_distance']},
    interpolation_linear_ref={$data[0]['interpolation_linear_ref']}
WHERE  frt_fid={$data[0]['frt_fid']}
EOQ;
            $this->db->exec($setLineSegmentSql);
        }
    }

}
