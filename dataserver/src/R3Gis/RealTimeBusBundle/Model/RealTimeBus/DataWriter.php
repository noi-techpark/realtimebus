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
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\WriterTask\Executable;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class DataWriter {

    private $db, $logger;
    private $filters = array();
    private $tasks = array();

    function __construct(Connection $db, $logger) {
        $this->db = $db;
        $this->logger = $logger;
    }

    function addFilter(DataFilter $filter) {
        $this->filters[] = $filter;
    }

    function addTask(Executable $task) {
        $this->tasks[] = $task;
    }

    static function wktFromGeoArray($jsonArray) {
        if ($jsonArray['type'] === 'Point') {
            return "POINT({$jsonArray['coordinates'][0]} {$jsonArray['coordinates'][1]})";
        } else {
            throw new \Exception("geometry type [{$jsonArray['type']}]not handled ");
        }
    }

    function write(array $features, $dataSrid, $dbSrid) {
        foreach ($features as $feature) {
            if (empty($feature['properties']['frt_fid'])) {
                $this->logger->info("feature has no frt_fid");
                continue;
            }
            $filterValue = 0;
            /*
              foreach ($this->filters as $filter) {
              $filterValue += $filter->filter($table, $feature, $dataSrid, $dbSrid);
              } */
            /*
              $fields .= ',filter';
              $placeholders .= ", $filterValue";

              $insertSql = "INSERT INTO $table ($fields) VALUES ($placeholders)";
              $stmt = $this->db->prepare($insertSql);
              $stmt->execute($values);
             */
            try {
                $this->db->beginTransaction();
                if (array_key_exists('geometry', $feature)) {
                    $wktString = $this->wktFromGeoArray($feature['geometry']);
                    $feature['geometry_sql'] = "ST_Transform(ST_GeomFromText('$wktString', $dataSrid), $dbSrid)";
                    $lineReference = new WriterTask\ActualPositionLineReference($this->db);
                    $lineReferenceData = $lineReference->getLineReference($feature);
                    $this->logger->info(var_export($lineReferenceData, true));
                    $feature['properties'] = array_merge($feature['properties'], $lineReferenceData);
                }
                
                foreach ($this->tasks as $task) {
                    $task->execute($feature['properties']['frt_fid'], $feature, $filterValue);
                }
                $this->db->commit();
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        }
    }

}
