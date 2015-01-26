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

use R3Gis\RealTimeBusBundle\Model\RealTimeBus\LinesUtils;
use R3Gis\RealTimeBusBundle\Model\RealTimeBus\Positions;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class PositionsController extends Controller {

    /**
     * @Route("/positions")
     * @Method({"GET"})
     */
    public function allPositionsAsJsonPAction(Request $request) {
        $callbackFunction = $request->query->get('jsonp');
        $srid = $this->container->getParameter('realtimebus.map.srid');
        $positions = new Positions($db = $this->get('doctrine')->getConnection(), $srid);

        $linesStr = $request->query->get('lines');
        if (!is_null($linesStr)) {
            $positions->setLines(LinesUtils::getLinesFromQuery($linesStr));
        }
        return ControllerUtils::jResponse($positions->positions(), $callbackFunction);
    }

}
