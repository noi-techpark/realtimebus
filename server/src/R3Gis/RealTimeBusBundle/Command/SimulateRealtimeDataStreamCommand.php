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

namespace R3Gis\RealTimeBusBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Doctrine\DBAL\Connection;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\FeatureList;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\DataSender;

/**
 * Load tester: check the limit for inserting new points
 * 
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class Loader {

    private $db;
    private $featureList;
    private $dataSender;
    private $stats = array();

    function __construct(Connection $db, FeatureList $featureList, DataSender $dataSender) {
        $this->db = $db;
        $this->featureList = $featureList;
        $this->dataSender = $dataSender;
    }

    function readFeaturesFromDb(&$vtId, $differenceInDays, $startWithFirst = true, $binSize = 50) {
        $constraints = array();
        $now = new \DateTime();
        $untilDate = $now->sub(new \DateInterval("P{$differenceInDays}D"));
        $constraints[] = "insert_date <='" . $untilDate->format('Y-m-d H:i:s') . "'::timestamp";
        $where = '';

        if (is_null($vtId) && !$startWithFirst) {
            // start with current data
            $sql = "SELECT MAX(vt_id) FROM vdv.filtered_vehicle_track";
            $vtId = $this->db->query($sql . " WHERE (" . implode(")\n    AND (", $constraints) . ")")->fetchColumn();
        }

        if (!is_null($vtId)) {
            $constraints[] = "vt_id > $vtId";
        }

        if (count($constraints) > 0) {
            $where = "WHERE (" . implode(")\n    AND (", $constraints) . ")";
        }
        $sql = <<<EOQ
SELECT
  vt_id,
  gps_date,
  delay_sec,
  notification_id,
  notification_date,
  notification_validity_date,
  acknowledge_date,
  course_id::bigint AS frt_fid,
  ST_AsGeoJSON(the_geom) AS json_geom
FROM vdv.filtered_vehicle_track
$where
ORDER BY vt_id
EOQ;

        $this->stats['tot_features'] = 0;
        $res = $this->db->query($sql);
        $lastSent = microtime(true);
        $trasmissionStart = microtime(true);

        while ($row = $res->fetch(\PDO::FETCH_ASSOC)) {
            $geometry = json_decode($row['json_geom'], true);
            $vtId = $row['vt_id'];
            $gpsDate = new \DateTime($row['gps_date']);
            $gpsDate->add(new \DateInterval("P{$differenceInDays}D"));
            $row['gps_date'] = $gpsDate->format('Y-m-d H:i:sO');
            unset($row['json_geom']);
            unset($row['vt_id']);

            $this->featureList->add($row, $geometry);
            if (($numFeatures = count($this->featureList->getFeatures())) >= $binSize) {
                $this->dataSender->send(json_encode($this->featureList->getFeatureCollection()));
                $this->featureList->clear();
                $featuresPerSec = $binSize / (microtime(true) - $lastSent);
                $this->stats['tot_features'] += $binSize;

                echo round($featuresPerSec) . " features/s, last inserted vt_id is $vtId\n";
                $lastSent = microtime(true);
            }
        }

        if (count($this->featureList->getFeatures()) > 0) {
            $this->dataSender->send(json_encode($this->featureList->getFeatureCollection()));
            $this->featureList->clear();
            $featuresPerSec = $numFeatures / (microtime(true) - $lastSent);
            $this->stats['tot_features'] += $numFeatures;

            echo round($featuresPerSec) . " features/s\n";
            $lastSent = microtime(true);
            $retval = true;
        } else {
            $retval = false;
        }
        $this->stats['elapsed_time'] = microtime(true) - $trasmissionStart;
        $this->stats['features_per_sec'] = $this->stats['tot_features'] / $this->stats['elapsed_time'];
    }

    public function getStats() {
        return $this->stats;
    }

}

class SimulateRealtimeDataStreamCommand extends ContainerAwareCommand {

    protected function configure() {
        $this->setName('vdv:simulate_realtime_data_stream')
                ->setDescription('Simulate incoming real time data');
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        
        
        $start = new \DateTime();
        $stopAt = new \DateTime();
        $stopAt->setTime(23, 59, 59);

        $output->writeln("Start simulating RT data stream at ".
                $start->format('Y-m-d H:i:s').", should stop at ".
                $stopAt->format('Y-m-d H:i:s'));
        $db = $this->getContainer()->get('doctrine')->getConnection();
        
        // delete data in db
        $db->exec("DELETE FROM vdv.vehicle_track");
        $db->exec("DELETE FROM vdv.vehicle_position_act");
        
        // $logger = $this->getContainer()->get('logger');
        $uploadUrl = "http://sasabus.ph.r3-gis/receiver";
        // $uploadUrl = "http://sasatest.r3-gis.com/receiver";
        $dataMinDatetimeString = $db->query("SELECT MIN(insert_date)::timestamp FROM vdv.filtered_vehicle_track")->fetchColumn();

        $dataMinDatetime = new \DateTime($dataMinDatetimeString);
        $differenceInDays = $dataMinDatetime->diff(new \DateTime())->format("%a");
        $output->writeln("Replay data from " . $differenceInDays . " days ago");

        $loader = new Loader($db, new FeatureList(), new DataSender($uploadUrl));
        $lastVt = null;
        while (true) {
            $moreDataAvailable = $loader->readFeaturesFromDb($lastVt, $differenceInDays, false);
            // $output->writeln("transmission statistics" . var_export($loader->getStats(), true));
            if (!$moreDataAvailable) {
                // break;
            }

            if (new \DateTime() > $stopAt) {
                $output->writeln("Script reached stop time");
                exit(0);
            }
            sleep(10);
        }
    }

}
