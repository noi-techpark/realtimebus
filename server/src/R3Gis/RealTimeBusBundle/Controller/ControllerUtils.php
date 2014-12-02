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

use Symfony\Component\HttpFoundation\Response;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class ControllerUtils {

    static public function jResponse($data, $callbackFunction) {
        if (!is_null($callbackFunction)) {
            // this should return as JSONP
            $response = new Response("$callbackFunction(" . json_encode($data) . ");");
            $response->headers->set('Content-Type', 'application/javascript');
            return $response;
        } else {
            // traditional JSON request
            $response = new Response(json_encode($data));
            $response->headers->set('Content-Type', 'application/json');
            return $response;
        }
    }

}