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
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class ExtrapolatePositionsCommand extends ContainerAwareCommand {

    protected function configure() {
        $this->setName('vdv:extrapolate_positions')
                ->setDescription('Extrapolate Bus positions')
                ->addArgument('lifetime', InputArgument::OPTIONAL, 'maximum execution time')
//                ->addOption('period', null, InputOption::OPTIONAL, 'time interval between 2 updates')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        $scriptStart = microtime(true);
        
        $period = 1.3;
 /*     $periodStr = trim($input->getOption('period'));
        if ($periodStr) {
            if (preg_match('/^\d+$/', $periodStr)) {
                $period = (int) $periodStr;
            } else {
                throw new Exception("value for period must be an integer, '$periodStr' given");
            }
        }*/

        $lifetimeStr = trim($input->getArgument('lifetime'));
        $lifetime = 300;
        if ($lifetimeStr) {
            if (preg_match('/^\d+$/', $lifetimeStr)) {
                $lifetime = (int) $lifetimeStr;
            } else {
                throw new \Exception("value for period must be an integer, '$lifetimeStr' given");
            }
        }

        $db = $this->getContainer()->get('doctrine')->getConnection();
        $logger = $this->getContainer()->get('logger');
        try {
            $loops = 0;
            for (;;) {
                $iterationStart = microtime(true);
                $db->exec('SET search_path=vdv,public;');
                $db->beginTransaction();
                $extrapolatedPositions = $db->query("SELECT vdv.vdv_extrapolate_positions()")->fetchColumn();
                $timeLeft = max(1, $period - (microtime(true) - $iterationStart));
                echo "loops: ". $loops++.", time left: $timeLeft, extrapolated $extrapolatedPositions positions\n";
                sleep($timeLeft);
                $db->commit();
                if (microtime(true) - $scriptStart > $lifetime) {
                    echo "end of script life reached\n";
                    break;
                }
            }
        } catch (Exception $e) {
            $db->rollback();
            $logger->debug($e->getMessage() . PHP_EOL . $e->getTraceAsString());
            throw $e;
        }
    }

}
