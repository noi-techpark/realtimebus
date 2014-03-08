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
class DataSender {
	private $url;
	
	function __construct($url, $authuser = null, $authpass = null) {
		$this->url = $url;
	}

	function send2($data) {
        $fh = fopen('php://memory', 'rw');
        fwrite($fh, $data);
        rewind($fh);
        $ch = curl_init($this->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_INFILE, $fh);
        curl_setopt($ch, CURLOPT_INFILESIZE, strlen($data));
        $result = curl_exec($ch);
		fclose($fh);
        $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
		if ($httpStatus !== 200) {
			throw new \Exception("Could not send data: $result");
		}
        return array($httpStatus, $result);
	}
	
	function send($data) {
        $ch = curl_init($this->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        $result = curl_exec($ch);
        $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
		if ($httpStatus !== 200) {
			throw new \Exception("Could not send data: $httpStatus - $result");
		}
        return array($httpStatus, $result);
	}
	
}
