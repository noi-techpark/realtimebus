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

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
use Doctrine\DBAL\Connection;

class LinesFinder {

    private $connection;

    public function __construct(Connection $connection) {
        $this->connection = $connection;
    }

    public function getAllLines($city) {

        // limit to ME lines, ATM
        $selectStops = <<<EOQ
SELECT rec_frt.li_nr, TRIM(rec_frt.str_li_var) AS str_li_var, lidname, li_ri_nr, li_r, li_g, li_b
FROM vdv.rec_frt
LEFT JOIN vdv.rec_lid
    ON rec_frt.li_nr=rec_lid.li_nr
    AND rec_frt.str_li_var=rec_lid.str_li_var
LEFT JOIN vdv.line_attributes
    ON rec_frt.li_nr=line_attributes.li_nr
WHERE rec_lid.li_kuerzel LIKE :city
GROUP BY rec_frt.li_nr, rec_frt.str_li_var, line_attributes.li_nr, lidname, li_ri_nr
EOQ;
	$res = $this->connection->prepare($selectStops);
	$res->bindValue("city",'%'.$city.'%');
	$res->execute();
        $lines = array();
        while ($row = $res->fetch(\PDO::FETCH_ASSOC)) {
            $lines[] = $row;
        }
        return $lines;
    }
    
    public function getActiveLines($timeHorizon,$city) {
      
        // limit to ME lines, ATM
        $selectStops = <<<EOQ
SELECT rec_frt.li_nr, TRIM(rec_frt.str_li_var) AS str_li_var, lidname, li_ri_nr, li_r, li_g, li_b
FROM vdv.rec_frt
LEFT JOIN vdv.rec_lid ON rec_frt.li_nr=rec_lid.li_nr AND rec_frt.str_li_var=rec_lid.str_li_var
INNER JOIN vdv.menge_tagesart
    ON rec_frt.tagesart_nr=menge_tagesart.tagesart_nr
INNER JOIN vdv.firmenkalender
    ON menge_tagesart.tagesart_nr=firmenkalender.tagesart_nr
LEFT JOIN vdv.line_attributes
    ON rec_frt.li_nr=line_attributes.li_nr
WHERE betriebstag=to_char(CURRENT_TIMESTAMP, 'YYYYMMDD')::integer
    AND CAST(CURRENT_DATE AS TIMESTAMP) AT TIME ZONE 'GMT+1' + frt_start * interval '1 seconds' > CURRENT_TIMESTAMP - interval '60 minutes'
    AND CAST(CURRENT_DATE AS TIMESTAMP) AT TIME ZONE 'GMT+1' + frt_start * interval '1 seconds' < CURRENT_TIMESTAMP + interval '$timeHorizon seconds'
    AND rec_lid.li_kuerzel LIKE :city
GROUP BY rec_frt.li_nr, rec_frt.str_li_var, line_attributes.li_nr, lidname, li_ri_nr
EOQ;
        
	$res = $this->connection->prepare($selectStops);
	$res->bindValue("city",'%'.$city.'%');
	$res->execute();
        $lines = array();
        while ($row = $res->fetch(\PDO::FETCH_ASSOC)) {
            $lines[] = $row;
        }
        return $lines;
    }
}
