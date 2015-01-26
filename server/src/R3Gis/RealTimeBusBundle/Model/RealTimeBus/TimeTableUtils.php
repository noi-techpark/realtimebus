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
class TimeTableUtils {

    private $conn;

    public function __construct(Connection $conn) {
        $this->conn = $conn;
    }

    public function insertTravelTimes($frtFid) {

        $insertSQL = <<<EOQ
INSERT INTO vdv.travel_times (frt_fid, li_lfd_nr_start, li_lfd_nr_end, travel_time)
(    
SELECT
    rec_frt.frt_fid,
    lvsp.li_lfd_nr,
    lvep.li_lfd_nr,
    SUM(COALESCE(sel_fzt))
FROM vdv.rec_frt
INNER JOIN vdv.lid_verlauf lvsp
     ON rec_frt.li_nr=lvsp.li_nr
    AND rec_frt.str_li_var=lvsp.str_li_var
INNER JOIN vdv.lid_verlauf lvep
     ON rec_frt.li_nr=lvep.li_nr
    AND rec_frt.str_li_var=lvep.str_li_var
    AND lvsp.li_lfd_nr < lvep.li_lfd_nr
INNER JOIN vdv.lid_verlauf lid_verlauf_start
     ON lid_verlauf_start.li_nr=rec_frt.li_nr
    AND lid_verlauf_start.str_li_var=rec_frt.str_li_var
    AND lid_verlauf_start.li_lfd_nr >= lvsp.li_lfd_nr
INNER JOIN vdv.lid_verlauf lid_verlauf_end
     ON lid_verlauf_end.li_nr=rec_frt.li_nr
    AND lid_verlauf_end.str_li_var=rec_frt.str_li_var
    AND lid_verlauf_start.li_lfd_nr+1=lid_verlauf_end.li_lfd_nr
    AND lid_verlauf_end.li_lfd_nr <= lvep.li_lfd_nr    
LEFT JOIN vdv.sel_fzt_feld sff
     ON lid_verlauf_start.ort_nr=sff.ort_nr
    AND lid_verlauf_start.onr_typ_nr=sff.onr_typ_nr
    AND lid_verlauf_end.ort_nr=sff.sel_ziel
    AND lid_verlauf_end.onr_typ_nr=sff.sel_ziel_typ
    AND rec_frt.fgr_nr=sff.fgr_nr
WHERE
    rec_frt.frt_fid=$frtFid
GROUP BY
    rec_frt.frt_fid,
    lvsp.li_lfd_nr,
    lvep.li_lfd_nr
ORDER BY
    rec_frt.frt_fid,
    lvsp.li_lfd_nr,
    lvep.li_lfd_nr
)
EOQ;

        return $this->conn->exec($insertSQL);
    }

}