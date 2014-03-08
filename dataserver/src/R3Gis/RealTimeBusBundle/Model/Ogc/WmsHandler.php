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

namespace R3Gis\RealTimeBusBundle\Model\Ogc;

use Symfony\Component\HttpFoundation\Request;
use Doctrine\DBAL\Connection;
//TODO: si incazza quando faccio throw new Exception.....

/**
 * @author Francesco D'Alesio <francesco.dalesio@r3-gis.com>
 */
class WmsHandler {
    private $connection;
    
    public function __construct(Connection $connection) {
        $this->connection = $connection;
    }
    
    public function getMapImage(Request $request) {
        //tutti i parametri in minuscolo
        $getRequestParams = $request->query->all();
        $requestParams = array();
        foreach($getRequestParams as $key => $val) {
            $requestParams[strtolower($key)] = $val;
        }
        //prendo il parametro layers, dove ci sono le linee da visualizzare in formato li_nr:str_li_var
        $layers = explode(',', $requestParams['layers']);
        if(count($layers) > 1 || $layers[0] != 'all') {
            $lines = array();
            $whereClauses = array();
            foreach($layers as $layer) {
                if(!strpos($layer, ':')) {
                    throw new Exception('Invalid layers parameter');
                }
                list($line, $var) = explode(':', $layer);
                array_push($lines, (int)$line);
                if (!preg_match('/[0-9a-z]+/i', $var)) {
                     throw new Exception('Invalid var paramter');
                }
                array_push($whereClauses, "(rec_lid.li_nr = ".(int)$line." and rec_lid.str_li_var = '$var')");
            }
        }
        
        $sql = "select li_nr, li_r, li_g, li_b from vdv.line_attributes";
        if(isset($lines)) $sql .= " where li_nr in (".implode(',',$lines).")";
        $res = $this->connection->query($sql);
        $classes = $res->fetchAll(\PDO::FETCH_ASSOC);
/*         $classes = array(
            array('li_nr'=>201, 'li_r'=>255, 'li_g'=>0, 'li_b'=>0),
            array('li_nr'=>211, 'li_r'=>0, 'li_g'=>255, 'li_b'=>0),
        ); */
        
        
	$layerData = "the_geom FROM (SELECT rec_lid.li_nr, rec_lid.str_li_var, rec_lid.li_nr || ':' || rec_lid.str_li_var as gc_objid, ST_Collect(ort_edges.the_geom) AS the_geom FROM vdv.rec_lid INNER JOIN vdv.lid_verlauf ON rec_lid.li_nr=lid_verlauf.li_nr AND rec_lid.str_li_var=lid_verlauf.str_li_var INNER JOIN vdv.lid_verlauf next_verlauf ON rec_lid.li_nr=next_verlauf.li_nr AND rec_lid.str_li_var=next_verlauf.str_li_var AND lid_verlauf.li_lfd_nr+1=next_verlauf.li_lfd_nr LEFT JOIN vdv.ort_edges ON lid_verlauf.ort_nr=ort_edges.start_ort_nr AND lid_verlauf.onr_typ_nr=ort_edges.start_onr_typ_nr AND next_verlauf.ort_nr=ort_edges.end_ort_nr AND next_verlauf.onr_typ_nr=ort_edges.end_onr_typ_nr ";
        // $layerData = "the_geom from (select the_geom, li_nr, li_nr || ':' || str_li_var as gc_objid from vdv.rec_lid ";
        if(isset($whereClauses)) $layerData .= "where ".implode(' OR ', $whereClauses);
        $layerData .= "GROUP BY rec_lid.li_nr, rec_lid.str_li_var) AS foo USING UNIQUE gc_objid USING SRID=25832";
         
        //  echo $layerData; die();
        //TODO: pescarlo da resources!
        $mapfilePath = __DIR__.'/../../Resources/config/lines_mapfile.map';
        $map = ms_newMapobj($mapfilePath);
        
        $layer = $map->getLayerByName('g_lines.line');
        $layer->set('data', $layerData);
        
        foreach($classes as $n => $classConfig) {
            $class = ms_newClassObj($layer);
            $class->set('name', 'dynamic_class_'.$n);
            $class->setExpression("('[li_nr]' eq '".$classConfig['li_nr']."')");
            $style = ms_newStyleObj($class);
            $style->color->setRGB($classConfig['li_r'], $classConfig['li_g'], $classConfig['li_b']);
            $style->outlinecolor->setRGB($classConfig['li_r'], $classConfig['li_g'], $classConfig['li_b']);
            $style->set('size', 3);
            $style->set('width', 3);
            //$style->width = 2;
            //$style->symbol = 'CIRCLE';
        }
        
        $objRequest = ms_newOwsrequestObj();
        $presetParams = array(
            'layers' => 'g_lines.line',
            'map'=>null
        );
        foreach($requestParams as $key => $value) {
            if(!is_string($key)) continue;
            if(!empty($presetParams[$key])) $objRequest->setParameter($key, $presetParams[$key]);
            else $objRequest->setParameter($key, stripslashes($value));
        }

        ms_ioinstallstdouttobuffer();
        $map->save('/tmp/debug.map');
        $map->owsdispatch($objRequest);
        $contentType = ms_iostripstdoutbuffercontenttype();
        
        //accrocchio, ma ms_iogetstdoutbufferstring() non funziona, mi da sempre una immagine vuota!
        ob_start();
        ms_iogetStdoutBufferBytes();
        $image = ob_get_contents();
        ob_end_clean();
        //die($image);
        ms_ioresethandlers();
        return array($contentType, $image);
    }
}