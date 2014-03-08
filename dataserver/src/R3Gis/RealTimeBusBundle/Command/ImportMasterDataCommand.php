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
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use R3Gis\RealTimeBusBundle\Model\VDV\DirDataImport;

/**
 * @author Peter Hopfgartner <peter.hopfgartner@r3-gis.com>
 */
class ImportMasterDataCommand extends ContainerAwareCommand {

    protected function configure() {
        $this->setName('vdv:import_data')
                ->setDescription('Import Master Data from VDV files')
                ->addArgument('vdvdir', InputArgument::REQUIRED, 'path to directory with the VDV files')
                ->addOption('yell', null, InputOption::VALUE_NONE, 'If set, the task will yell in uppercase letters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {

        $db = $this->getContainer()->get('doctrine')->getConnection();
        $logger = $this->getContainer()->get('logger');
        $importer = new DirDataImport($db, $logger);


        $vdvFilesDir = $input->getArgument('vdvdir');
        if (!file_exists($vdvFilesDir)) {
            throw new Exception("$vdvFilesDir does not exist");
        }
        if (!is_dir($vdvFilesDir)) {
            throw new Exception("$vdvFilesDir is not a directory");
        }
        if (!file_exists($vdvFilesDir)) {
            throw new Exception("$vdvFilesDir does not exist");
        }
        
        $vdvFilesDir = realpath($vdvFilesDir) . '/';
        
        $tables = $this->getContainer()->getParameter('vdv.import.tables');
        $dataSrid = $this->getContainer()->getParameter('vdv.import.srid');
        $dbSrid = $this->getContainer()->getParameter('vdv.srid');

        try {
            $db->exec('SET search_path=vdv,public;');
            $db->beginTransaction();
            $importer->execute($vdvFilesDir, $tables, $dataSrid, $dbSrid);
            $db->commit();
        } catch (Exception $e) {
            $db->rollback();
            $logger->debug($e->getMessage() . PHP_EOL . $e->getTraceAsString());
            throw $e;
        }
    }

}
