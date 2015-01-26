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
class DropOldPositionsCommand extends ContainerAwareCommand {

    protected function configure() {
        $this->setName('vdv:drop_old_positions')
                ->setDescription('Drop positions older then from the database')
                ->addArgument('seconds', InputArgument::OPTIONAL, 'maximum data age')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {

        $db = $this->getContainer()->get('doctrine')->getConnection();
        $logger = $this->getContainer()->get('logger');


        
        $maxAgeInSeconds = $input->getArgument('seconds');
        if ((float)$maxAgeInSeconds > 0) {
            $maxAgeInSeconds = (float) $maxAgeInSeconds;
        } else {
            $maxAgeInSeconds = 600;
        }
        
        try {
            $db->exec('SET search_path=vdv,public;');
            $db->beginTransaction();
            $db->exec("DELETE FROM vdv.vehicle_track WHERE age(insert_date) > interval '{$maxAgeInSeconds} seconds'");
            $db->commit();
        } catch (Exception $e) {
            $db->rollback();
            $logger->debug($e->getMessage() . PHP_EOL . $e->getTraceAsString());
            throw $e;
        }
    }

}
