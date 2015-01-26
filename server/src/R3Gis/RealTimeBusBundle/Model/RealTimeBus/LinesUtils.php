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
class LinesUtils {

    static function getLinesFromQuery($linesStr) {
        $lines = array();
        if (!empty($linesStr)) {
            if (!preg_match('/^\d+:[a-z0-9]+(,\d+:[a-z0-9]+)*$/i', $linesStr)) {
                throw new \Exception("$linesStr has invalid format");
            }
            $linesFragments = explode(',', $linesStr);
            foreach ($linesFragments as $linesFragment) {
                $line = array();
                list($line['li_nr'], $line['str_li_var']) = explode(':', $linesFragment);
                $lines[] = $line;
            }
        }
        return $lines;
    }

    static function whereLines($field1, $field2, array $lines) {
        $isFirst = true;
        $whereLines = '';
        foreach ($lines as $lineData) {
            if ($isFirst) {
                $isFirst = false;
            } else {
                $whereLines .= " OR\n    ";
            }
            $whereLines .= "($field1={$lineData['li_nr']} AND $field2='{$lineData['str_li_var']}')";
        }

        return $whereLines;
    }

}