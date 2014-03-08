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

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class SimulateClientsLoadCommand extends ContainerAwareCommand {

    protected function configure() {
        $this->setName('vdv:simulate_clients_load')
                ->setDescription('Simulate load on server due to clients');
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        $output->writeln("Start simulating Clients load");

        $startLine = $start = microtime(true);
        $numAttemps = 1000;
        for ($i = 0; $i < $numAttemps;) {
            $ch = curl_init('http://sasabus.r3-gis/positions');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $result = curl_exec($ch);
            $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            echo "#";
            $i++;
            if ($i % 10 == 0 && $i != 0 && $i % 50 != 0) {
                echo ' ';
            }
            if ($i % 50 == 0) {
                if ($i != 0) {
                    echo round(50 / (microtime(true) - $startLine), 2)." req/s\n";
                }
                $startLine = microtime(true);
            }
            if ($httpStatus !== 200) {
                throw new \Exception("Could not send data: $httpStatus - $result");
            }
        }
        $elapsedTime = microtime(true) - $start;
        $output->writeln("$numAttemps attemps in " . round($elapsedTime, 3) . " s (" . round($numAttemps / $elapsedTime, 1) . " req/s)");
    }

}
