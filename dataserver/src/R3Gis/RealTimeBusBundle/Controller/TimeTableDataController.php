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

use R3Gis\RealTimeBusBundle\Model\RealTimeBus\StopsFinder;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\CoursesFinder;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\LinesFinder;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\LinesUtils;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class TimeTableDataController extends Controller {

    /**
     * @Route("/time")
     * @Method({"GET"})
     */
    public function timeAction(Request $request) {
        $callbackFunction = $request->query->get('jsonp');
        
        return ControllerUtils::jResponse(array('time' => time()), $callbackFunction);
    }
    
    /**
     * @Route("/{frt_fid}/stops")
     * @Method({"GET"})
     */
    public function nextStopsAction(Request $request, $frt_fid) {
        $callbackFunction = $request->query->get('jsonp');

        $srid = $this->container->getParameter('realtimebus.map.srid');
        $stopsFinder = new StopsFinder($db = $this->get('doctrine')->getConnection(), $srid);
        return ControllerUtils::jResponse($stopsFinder->getNextStops($frt_fid), $callbackFunction);
    }

    /**
     * @Route("/stops")
     * @Method({"GET"})
     */
    public function allStopsAction(Request $request) {
        $callbackFunction = $request->query->get('jsonp');

        $srid = $this->container->getParameter('realtimebus.map.srid');
        $stopsFinder = new StopsFinder($db = $this->get('doctrine')->getConnection(), $srid);
        $linesStr = $request->query->get('lines');
        if (!is_null($linesStr)) {
            $stopsFinder->setLines(LinesUtils::getLinesFromQuery($linesStr));
        }
        
        return ControllerUtils::jResponse($stopsFinder->getStops(), $callbackFunction);
    }

    /**
     * @Route("/{stop}/buses")
     * @Method({"GET"})
     */
    public function nextBusesAction(Request $request, $stop) {
        $callbackFunction = $request->query->get('jsonp');
        $stopId = array();
        if (preg_match('/^(\d+)\.(\d+)$/', $stop, $matches)) {
            $stopId['ort_nr'] = $matches[1];
            $stopId['onr_typ_nr'] = $matches[2];
        } else {
            throw new \Exception("$stop is an invalid stop");
        }
        $limit = $this->container->getParameter('realtimebus.timetable.next_stops_limit');
        $coursesFinder = new CoursesFinder($db = $this->get('doctrine')->getConnection());
        return ControllerUtils::jResponse($coursesFinder->getCourses($stopId, $limit), $callbackFunction);
    }

    /**
     * @Route("/lines/all")
     * @Method({"GET"})
     */
    public function fetchAllLinesAction(Request $request) {
        $callbackFunction = $request->query->get('jsonp');

        $linesFinder = new LinesFinder($this->get('doctrine')->getConnection());
        return ControllerUtils::jResponse($linesFinder->getAllLines(), $callbackFunction);
    }

    /**
     * @Route("/lines")
     * @Method({"GET"})
     */
    public function fetchLinesAction(Request $request) {
        $callbackFunction = $request->query->get('jsonp');
        $timeHorizon = $this->container->getParameter('realtimebus.timetable.time_horizon');
        $conn = $this->get('doctrine')->getConnection();
        $linesFinder = new LinesFinder($conn);
        return ControllerUtils::jResponse($linesFinder->getActiveLines($timeHorizon), $callbackFunction);
    }
}
