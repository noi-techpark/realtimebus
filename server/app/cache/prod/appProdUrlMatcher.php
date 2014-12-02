<?php

use Symfony\Component\Routing\Exception\MethodNotAllowedException;
use Symfony\Component\Routing\Exception\ResourceNotFoundException;
use Symfony\Component\Routing\RequestContext;

/**
 * appProdUrlMatcher
 *
 * This class has been auto-generated
 * by the Symfony Routing Component.
 */
class appProdUrlMatcher extends Symfony\Bundle\FrameworkBundle\Routing\RedirectableUrlMatcher
{
    /**
     * Constructor.
     */
    public function __construct(RequestContext $context)
    {
        $this->context = $context;
    }

    public function match($pathinfo)
    {
        $allow = array();
        $pathinfo = rawurldecode($pathinfo);

        // r3gis_realtimebus_default_index
        if (rtrim($pathinfo, '/') === '') {
            if (substr($pathinfo, -1) !== '/') {
                return $this->redirect($pathinfo.'/', 'r3gis_realtimebus_default_index');
            }

            return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\DefaultController::indexAction',  '_route' => 'r3gis_realtimebus_default_index',);
        }

        // r3gis_realtimebus_geocoding_geocode
        if ($pathinfo === '/geocode') {
            if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                $allow = array_merge($allow, array('GET', 'HEAD'));
                goto not_r3gis_realtimebus_geocoding_geocode;
            }

            return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\GeocodingController::geocodeAction',  '_route' => 'r3gis_realtimebus_geocoding_geocode',);
        }
        not_r3gis_realtimebus_geocoding_geocode:

        // r3gis_realtimebus_ogc_wmsendpoint
        if ($pathinfo === '/ogc/wms') {
            if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                $allow = array_merge($allow, array('GET', 'HEAD'));
                goto not_r3gis_realtimebus_ogc_wmsendpoint;
            }

            return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\OgcController::wmsEndPointAction',  '_route' => 'r3gis_realtimebus_ogc_wmsendpoint',);
        }
        not_r3gis_realtimebus_ogc_wmsendpoint:

        if (0 === strpos($pathinfo, '/p')) {
            // r3gis_realtimebus_pingdom_pingdom
            if ($pathinfo === '/pingdom') {
                if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                    $allow = array_merge($allow, array('GET', 'HEAD'));
                    goto not_r3gis_realtimebus_pingdom_pingdom;
                }

                return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\PingdomController::pingdomAction',  '_route' => 'r3gis_realtimebus_pingdom_pingdom',);
            }
            not_r3gis_realtimebus_pingdom_pingdom:

            // r3gis_realtimebus_positions_allpositionsasjsonp
            if ($pathinfo === '/positions') {
                if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                    $allow = array_merge($allow, array('GET', 'HEAD'));
                    goto not_r3gis_realtimebus_positions_allpositionsasjsonp;
                }

                return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\PositionsController::allPositionsAsJsonPAction',  '_route' => 'r3gis_realtimebus_positions_allpositionsasjsonp',);
            }
            not_r3gis_realtimebus_positions_allpositionsasjsonp:

        }

        // r3gis_realtimebus_receiver_receiver
        if ($pathinfo === '/receiver') {
            if ($this->context->getMethod() != 'POST') {
                $allow[] = 'POST';
                goto not_r3gis_realtimebus_receiver_receiver;
            }

            return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\ReceiverController::receiverAction',  '_route' => 'r3gis_realtimebus_receiver_receiver',);
        }
        not_r3gis_realtimebus_receiver_receiver:

        // r3gis_realtimebus_receiver_masterdata
        if ($pathinfo === '/master_data') {
            if ($this->context->getMethod() != 'POST') {
                $allow[] = 'POST';
                goto not_r3gis_realtimebus_receiver_masterdata;
            }

            return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\ReceiverController::masterDataAction',  '_route' => 'r3gis_realtimebus_receiver_masterdata',);
        }
        not_r3gis_realtimebus_receiver_masterdata:

        // r3gis_realtimebus_timetabledata_time
        if ($pathinfo === '/time') {
            if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                $allow = array_merge($allow, array('GET', 'HEAD'));
                goto not_r3gis_realtimebus_timetabledata_time;
            }

            return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\TimeTableDataController::timeAction',  '_route' => 'r3gis_realtimebus_timetabledata_time',);
        }
        not_r3gis_realtimebus_timetabledata_time:

        // r3gis_realtimebus_timetabledata_nextstops
        if (preg_match('#^/(?P<frt_fid>[^/]++)/stops$#s', $pathinfo, $matches)) {
            if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                $allow = array_merge($allow, array('GET', 'HEAD'));
                goto not_r3gis_realtimebus_timetabledata_nextstops;
            }

            return $this->mergeDefaults(array_replace($matches, array('_route' => 'r3gis_realtimebus_timetabledata_nextstops')), array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\TimeTableDataController::nextStopsAction',));
        }
        not_r3gis_realtimebus_timetabledata_nextstops:

        // r3gis_realtimebus_timetabledata_allstops
        if ($pathinfo === '/stops') {
            if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                $allow = array_merge($allow, array('GET', 'HEAD'));
                goto not_r3gis_realtimebus_timetabledata_allstops;
            }

            return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\TimeTableDataController::allStopsAction',  '_route' => 'r3gis_realtimebus_timetabledata_allstops',);
        }
        not_r3gis_realtimebus_timetabledata_allstops:

        // r3gis_realtimebus_timetabledata_nextbuses
        if (preg_match('#^/(?P<stop>[^/]++)/buses$#s', $pathinfo, $matches)) {
            if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                $allow = array_merge($allow, array('GET', 'HEAD'));
                goto not_r3gis_realtimebus_timetabledata_nextbuses;
            }

            return $this->mergeDefaults(array_replace($matches, array('_route' => 'r3gis_realtimebus_timetabledata_nextbuses')), array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\TimeTableDataController::nextBusesAction',));
        }
        not_r3gis_realtimebus_timetabledata_nextbuses:

        if (0 === strpos($pathinfo, '/lines')) {
            // r3gis_realtimebus_timetabledata_fetchalllines
            if ($pathinfo === '/lines/all') {
                if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                    $allow = array_merge($allow, array('GET', 'HEAD'));
                    goto not_r3gis_realtimebus_timetabledata_fetchalllines;
                }

                return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\TimeTableDataController::fetchAllLinesAction',  '_route' => 'r3gis_realtimebus_timetabledata_fetchalllines',);
            }
            not_r3gis_realtimebus_timetabledata_fetchalllines:

            // r3gis_realtimebus_timetabledata_fetchlines
            if ($pathinfo === '/lines') {
                if (!in_array($this->context->getMethod(), array('GET', 'HEAD'))) {
                    $allow = array_merge($allow, array('GET', 'HEAD'));
                    goto not_r3gis_realtimebus_timetabledata_fetchlines;
                }

                return array (  '_controller' => 'R3Gis\\RealTimeBusBundle\\Controller\\TimeTableDataController::fetchLinesAction',  '_route' => 'r3gis_realtimebus_timetabledata_fetchlines',);
            }
            not_r3gis_realtimebus_timetabledata_fetchlines:

        }

        throw 0 < count($allow) ? new MethodNotAllowedException(array_unique($allow)) : new ResourceNotFoundException();
    }
}
