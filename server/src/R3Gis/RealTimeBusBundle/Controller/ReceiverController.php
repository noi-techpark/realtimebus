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

namespace R3Gis\RealTimeBusBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\DataWriter;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\DataFilterSpikes;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\DataFilterFrtExists;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\FeatureList;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\WriterTask\ActualPositionUpdater;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\WriterTask\ActualPositionLineReference;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class ReceiverController extends Controller {

    /**
     * @Route("/receiver")
     * @Method({"POST"})
     */
    public function receiverAction(Request $request) {

        $db = $this->get('doctrine')->getConnection();
        $maxSpeed = $this->container->getParameter('vdv.import.max_speed');
        $dbSrid = $this->container->getParameter('vdv.srid');
        $dataSrid = $this->container->getParameter('vdv.import.srid');
        $this->get('logger')->debug(__METHOD__ . ": dbSrid=$dbSrid, dataSrid=$dataSrid");

        // check 
        try {
            if (true) {
                $cacheDir = $this->container->getParameter("kernel.cache_dir");
                $debugOutDir = $cacheDir . '/' . date('Y-m-d');
                if (!file_exists($debugOutDir)) {
                    if (false === mkdir($debugOutDir)) {
                        throw new Exception("Could not create $debugOutDir");
                    }
                } else if (is_dir($debugOutDir)) {
                    $debugFile = $debugOutDir . '/' . date('His') . '.geojson';
                } else {
                    throw new Exception("$debugOutDir is not a directory");
                }
            }
            $featureList = FeatureList::createFromGeoJSON($request->getContent());
            $dataWriter = new DataWriter($db, $this->get('logger'));
            // $dataWriter->addFilter(new DataFilterSpikes($db, $maxSpeed));
            $dataWriter->addFilter(new DataFilterFrtExists($db, $this->get('logger')));
            $dataWriter->addTask(new ActualPositionUpdater($db));
            $dataWriter->addTask(new ActualPositionLineReference($db));
            $dataWriter->write($featureList->getFeatures(), $dataSrid, $dbSrid);
            return new Response("Data written");
        } catch (Exception $e) {
            $this->get('logger')->warning(__METHOD__ . ", " . $e->getMessage() . PHP_EOL . $e->getTraceAsString());
            $response = new Response();
            $response->setStatus(450, "Upload problems: " . $e->getMessage());
            return $response;
        }
    }

    /**
     * @Route("/master_data")
     * @Method({"POST"})
     */
    public function masterDataAction(Request $request) {
        $db = $this->get('doctrine')->getConnection();

        // check 
        try {
            $db->beginTransaction();
            $db->commit();
            return new Response("Data written");
        } catch (Exception $e) {
            $db->rollback();
            $this->get('logger')->warning(__METHOD__ . ", " . $e->getMessage() . PHP_EOL . $e->getTraceAsString());
            $response = new Response();
            $response->setStatus(450, "Upload problems: " . $e->getMessage());
            return $response;
        }
    }

}
