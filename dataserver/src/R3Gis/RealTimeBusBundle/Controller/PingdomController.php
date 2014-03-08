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

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class PingdomController extends Controller {

    /**
     * @Route("/pingdom")
     * @Method({"GET"})
     */
    public function pingdomAction(Request $request) {
        $ageThreshold = 300; 
        $result = 'OK';
        $now = new \DateTime();
        $nowDayMinutes = $now->format('H') * 60 + $now->format('i');
        if ($nowDayMinutes > 6 * 60 &&
            $nowDayMinutes < 22 * 60) {
            $db = $this->get('doctrine')->getConnection(); 
            $record = $db->query('SELECT COUNT(*), EXTRACT(EPOCH FROM age(max(insert_date))) FROM vdv.vehicle_position_act')->fetch(\PDO::FETCH_NUM);
            if ($record[0] == 0){
                $result = 'No data found';
            } else if ($record[1] > $ageThreshold){
                $result = 'No fresh data found';
            }
        }
        return new Response($result, 200, array('Content-Type' => 'text/plain'));
    }
}
