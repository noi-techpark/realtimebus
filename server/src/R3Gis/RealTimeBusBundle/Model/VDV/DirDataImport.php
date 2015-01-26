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
use R3Gis\RealTimeBusBundle\Model\VDV\DBConnector\DataPump;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class DirDataImport {

    private $conn;
    private $logger;

    public function __construct(Connection $conn, $logger) {
        $this->conn = $conn;
        $this->logger = $logger;
    }

    public function execute($vdvFilesDir, array $tables, $dataSrid, $dbSrid) {

        $dataSrid = $this->conn->quote($dataSrid);
        $dbSrid = $this->conn->quote($dbSrid);

        $reversedTables = array_reverse($tables);

        foreach ($reversedTables as $revTable) {
            $this->logger->debug("deleting $revTable");
            $this->conn->exec("DELETE FROM $revTable");
        }

        foreach ($tables as $importTable) {
            $this->logger->debug("$importTable");
            $file = "{$vdvFilesDir}{$importTable}.X10";
            if (!file_exists($file)) {
                throw new \Exception("Could not find file $file");
            }

            $parser = new Parser($file);
            $dataPump = new DataPump();
            $records = $dataPump->pumpToDb($this->conn, $parser);
            if ($importTable == 'REC_FRT') {
                $this->logger->debug("add missing records from REC_FRT to MENGE_FGR");
                $insertFgrSql = <<<EOQ
INSERT INTO vdv.menge_fgr
    (basis_version, fgr_nr, fgr_text)
(
SELECT 1, rec_frt.fgr_nr, 'Generated during import on ' || to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD')
FROM vdv.rec_frt
LEFT JOIN vdv.menge_fgr
    ON rec_frt.fgr_nr=menge_fgr.fgr_nr
WHERE menge_fgr.fgr_nr IS NULL
GROUP BY rec_frt.fgr_nr
ORDER BY rec_frt.fgr_nr
)
EOQ;
                $insertFgrRecords = $this->conn->exec($insertFgrSql);
                $this->logger->debug("inserted $insertFgrRecords records in menge_fgr");


                $this->logger->debug("add missing records from REC_FRT to REC_LID");
                $insertLidSql = <<<EOQ
INSERT INTO vdv.rec_lid
    (basis_version, li_nr, str_li_var, lidname)
(
SELECT 1, rec_frt.li_nr, rec_frt.str_li_var, 'Generated during import of ' || to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD')
FROM vdv.rec_frt
LEFT JOIN vdv.rec_lid
    ON rec_frt.li_nr=rec_lid.li_nr
    AND rec_frt.str_li_var=rec_lid.str_li_var
WHERE rec_lid.li_nr IS NULL
GROUP BY rec_frt.li_nr, rec_frt.str_li_var
ORDER BY rec_frt.li_nr, rec_frt.str_li_var
)
EOQ;
                $insertedLidRecords = $this->conn->exec($insertLidSql);
                $this->logger->debug("inserted $insertedLidRecords records in rec_lid");
            }
            $this->logger->debug("pumped $records into $importTable");
        }

        // check if mappings shall be imported
        $mappingsFile = "{$vdvFilesDir}teqnummern.csv";
        if (file_exists($mappingsFile)) {
            $this->logger->debug("add mapping of TEQ ids");
           
            if (($fh = fopen($mappingsFile, "r")) === FALSE) {
                throw new \Exception("Could not fopen($mappingsFile, \"r\")");
            }
            $isFirst = true;
            while (($line = fgets($fh)) !== false) {
                if ($isFirst) {
                    $isFirst = false;
                    continue;
                }
                $data = preg_split('/\s+/', trim($line));
                if (count($data) == 2) {
                    if (is_numeric($data[0]) && is_numeric($data[1])) {
                        $insertSql = <<<EOQ
UPDATE vdv.rec_frt
SET teq_nummer={$data[1]}
WHERE frt_fid={$data[0]}
EOQ;
                        $numUpdates = $this->conn->exec($insertSql);
                        if ($numUpdates != 1) {
                            $this->logger->info("$numUpdates rows in vdv.rec_frt were updated");
                        }
                    } else {
                        $this->logger->notice("invalid data: " . var_export($data, true));
                    }
                } else {
                    $this->logger->notice("invalid data: " . var_export($data, true));
                }
            }
        } else {
            $this->logger->notice("frt mapping file $mappingsFile not found");
        }

        // calculate the time table for all data
        $this->logger->debug("calculate travel_times");
        $this->conn->exec("DELETE FROM vdv.travel_times");
        $this->conn->query("SELECT vdv.vdv_fill_travel_times();")->fetchAll(\PDO::FETCH_NUM);

        // calculate last stop for each frt_fid
        $deleted = $this->conn->exec("DELETE FROM vdv.frt_ort_last");
        $this->logger->debug("deleted $deleted records from vdv.frt_ort_last");

        $insertFrtOrtLst = <<<EOQ
INSERT INTO vdv.frt_ort_last (frt_fid, onr_typ_nr, ort_nr)
(
SELECT DISTINCT ON (frt_fid) frt_fid, onr_typ_nr, ort_nr
FROM vdv.rec_frt
LEFT JOIN vdv.lid_verlauf
    ON rec_frt.li_nr=lid_verlauf.li_nr
    AND rec_frt.str_li_var=lid_verlauf.str_li_var
ORDER BY frt_fid, li_lfd_nr DESC
);
EOQ;
        $inserted = $this->conn->exec($insertFrtOrtLst);
        $this->logger->debug("inserted $inserted records into vdv.frt_ort_last");

        // write the positions in rec_ort
        $this->logger->debug("set geometries in REC_ORT");
        $writePositionsSql = <<<EOQ
UPDATE vdv.rec_ort
SET the_geom =
    ST_Transform(
        ST_SetSRID(
	        ST_MakePoint(
                vdv.vdv_bigint_2_degree(ort_pos_laenge),
		        vdv.vdv_bigint_2_degree(ort_pos_breite)
	        ), $dataSrid
        ), $dbSrid
    );
EOQ;

        $this->conn->exec($writePositionsSql);

        $this->logger->debug("set geometries in LID_VERLAUF");
        $calculateVerlaufSql = <<<EOQ
UPDATE vdv.lid_verlauf
SET the_geom=ort_edges.the_geom
FROM vdv.lid_verlauf verlauf_next,
 vdv.ort_edges
    WHERE lid_verlauf.li_nr=verlauf_next.li_nr
    AND lid_verlauf.str_li_var=verlauf_next.str_li_var
    AND lid_verlauf.li_lfd_nr+1=verlauf_next.li_lfd_nr
    AND lid_verlauf.ort_nr=ort_edges.start_ort_nr
    AND lid_verlauf.onr_typ_nr=ort_edges.start_onr_typ_nr
    AND verlauf_next.ort_nr=ort_edges.end_ort_nr
    AND verlauf_next.onr_typ_nr=ort_edges.end_onr_typ_nr
EOQ;
        $this->conn->exec($calculateVerlaufSql);
        
        $calculateMissingVerlaufSql = <<<EOQ
UPDATE vdv.lid_verlauf
SET the_geom = 
(
SELECT
ST_Force_2D(ST_MakeLine(rec_ort_start.the_geom, rec_ort_end.the_geom))
FROM vdv.rec_lid
INNER JOIN vdv.lid_verlauf lid_verlauf_start
    ON lid_verlauf_start.li_nr=rec_lid.li_nr
    AND lid_verlauf_start.str_li_var=rec_lid.str_li_var
INNER JOIN vdv.lid_verlauf lid_verlauf_end
    ON lid_verlauf_start.li_nr=lid_verlauf_end.li_nr
    AND lid_verlauf_start.str_li_var=lid_verlauf_end.str_li_var
    AND lid_verlauf_start.li_lfd_nr + 1 = lid_verlauf_end.li_lfd_nr
INNER JOIN vdv.rec_ort rec_ort_start
    ON lid_verlauf_start.onr_typ_nr =  rec_ort_start.onr_typ_nr
    AND lid_verlauf_start.ort_nr = rec_ort_start.ort_nr
INNER JOIN vdv.rec_ort rec_ort_end
    ON lid_verlauf_end.onr_typ_nr =  rec_ort_end.onr_typ_nr
    AND lid_verlauf_end.ort_nr = rec_ort_end.ort_nr
WHERE lid_verlauf.li_nr=lid_verlauf_start.li_nr
    AND lid_verlauf.str_li_var=lid_verlauf_start.str_li_var
    AND lid_verlauf.li_lfd_nr=lid_verlauf_start.li_lfd_nr
)
WHERE lid_verlauf.the_geom IS NULL
EOQ;
        $filledMissing = $this->conn->exec($calculateMissingVerlaufSql);
        $this->logger->info("$filledMissing records in LID_VERLAUF have no exact geomatry and were linearly interpolated");
        
        $this->logger->debug("set geometries in REC_LID");
        
        // TODO: fill with exact geometries, but this requires a better verificatipon of the geometries
        $calculateLineSkeleton = <<<EOQ
UPDATE vdv.rec_lid
SET the_geom = 
(SELECT
ST_MakeLine(ST_Force_2D(rec_ort.the_geom) ORDER BY li_lfd_nr)
FROM vdv.lid_verlauf
INNER JOIN vdv.rec_ort ON lid_verlauf.ort_nr=rec_ort.ort_nr
    AND lid_verlauf.onr_typ_nr=rec_ort.onr_typ_nr
WHERE lid_verlauf.li_nr=rec_lid.li_nr
    AND lid_verlauf.str_li_var=rec_lid.str_li_var
)
EOQ;

        $this->conn->exec($calculateLineSkeleton);
    }
}