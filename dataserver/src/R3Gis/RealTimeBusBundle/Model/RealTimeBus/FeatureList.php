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
class FeatureList {
    private $features = array();
    
	function add(array $properties, $geometry) {
		$feature = array(
			"type" => "Feature",
			"geometry" => $geometry,
			"properties" => $properties,
		);
		$this->features[] = $feature;
		return $this; 
	}
	
	function clear() {
		$this->features = array();
		return $this;
	}

	function getFeatures() {
		return $this->features;
	}
	
    function getFeatureCollection() {
		$featureCollection = array(
			"type" => "FeatureCollection",
			"features" => $this->features,
		);
		return $featureCollection;
	}
		
	static function createFromGeoJSON($geoJSON) {
		$data = json_decode($geoJSON, true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new Exception("data is not in JSON Format");
		}
		return self::createFromArray($data);
	}
	
	static function createFromArray(array $geoArray) {
		
		if (!array_key_exists('features', $geoArray)) {
			throw new Exception("no features found");
		}
		
		$instance = new FeatureList();
		
		foreach ($geoArray['features'] as $feature) {
			$instance->add($feature['properties'], $feature['geometry']);
		}
		return $instance;
	}
	
}