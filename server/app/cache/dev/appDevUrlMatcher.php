<?php

use Symfony\Component\Routing\Exception\MethodNotAllowedException;
use Symfony\Component\Routing\Exception\ResourceNotFoundException;
use Symfony\Component\Routing\RequestContext;

/**
 * appDevUrlMatcher
 *
 * This class has been auto-generated
 * by the Symfony Routing Component.
 */
class appDevUrlMatcher extends Symfony\Bundle\FrameworkBundle\Routing\RedirectableUrlMatcher
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

        if (0 === strpos($pathinfo, '/_')) {
            // _wdt
            if (0 === strpos($pathinfo, '/_wdt') && preg_match('#^/_wdt/(?P<token>[^/]++)$#s', $pathinfo, $matches)) {
                return $this->mergeDefaults(array_replace($matches, array('_route' => '_wdt')), array (  '_controller' => 'web_profiler.controller.profiler:toolbarAction',));
            }

            if (0 === strpos($pathinfo, '/_profiler')) {
                // _profiler_home
                if (rtrim($pathinfo, '/') === '/_profiler') {
                    if (substr($pathinfo, -1) !== '/') {
                        return $this->redirect($pathinfo.'/', '_profiler_home');
                    }

                    return array (  '_controller' => 'web_profiler.controller.profiler:homeAction',  '_route' => '_profiler_home',);
                }

                if (0 === strpos($pathinfo, '/_profiler/search')) {
                    // _profiler_search
                    if ($pathinfo === '/_profiler/search') {
                        return array (  '_controller' => 'web_profiler.controller.profiler:searchAction',  '_route' => '_profiler_search',);
                    }

                    // _profiler_search_bar
                    if ($pathinfo === '/_profiler/search_bar') {
                        return array (  '_controller' => 'web_profiler.controller.profiler:searchBarAction',  '_route' => '_profiler_search_bar',);
                    }

                }

                // _profiler_purge
                if ($pathinfo === '/_profiler/purge') {
                    return array (  '_controller' => 'web_profiler.controller.profiler:purgeAction',  '_route' => '_profiler_purge',);
                }

                // _profiler_info
                if (0 === strpos($pathinfo, '/_profiler/info') && preg_match('#^/_profiler/info/(?P<about>[^/]++)$#s', $pathinfo, $matches)) {
                    return $this->mergeDefaults(array_replace($matches, array('_route' => '_profiler_info')), array (  '_controller' => 'web_profiler.controller.profiler:infoAction',));
                }

                // _profiler_phpinfo
                if ($pathinfo === '/_profiler/phpinfo') {
                    return array (  '_controller' => 'web_profiler.controller.profiler:phpinfoAction',  '_route' => '_profiler_phpinfo',);
                }

                // _profiler_search_results
                if (preg_match('#^/_profiler/(?P<token>[^/]++)/search/results$#s', $pathinfo, $matches)) {
                    return $this->mergeDefaults(array_replace($matches, array('_route' => '_profiler_search_results')), array (  '_controller' => 'web_profiler.controller.profiler:searchResultsAction',));
                }

                // _profiler
                if (preg_match('#^/_profiler/(?P<token>[^/]++)$#s', $pathinfo, $matches)) {
                    return $this->mergeDefaults(array_replace($matches, array('_route' => '_profiler')), array (  '_controller' => 'web_profiler.controller.profiler:panelAction',));
                }

                // _profiler_router
                if (preg_match('#^/_profiler/(?P<token>[^/]++)/router$#s', $pathinfo, $matches)) {
                    return $this->mergeDefaults(array_replace($matches, array('_route' => '_profiler_router')), array (  '_controller' => 'web_profiler.controller.router:panelAction',));
                }

                // _profiler_exception
                if (preg_match('#^/_profiler/(?P<token>[^/]++)/exception$#s', $pathinfo, $matches)) {
                    return $this->mergeDefaults(array_replace($matches, array('_route' => '_profiler_exception')), array (  '_controller' => 'web_profiler.controller.exception:showAction',));
                }

                // _profiler_exception_css
                if (preg_match('#^/_profiler/(?P<token>[^/]++)/exception\\.css$#s', $pathinfo, $matches)) {
                    return $this->mergeDefaults(array_replace($matches, array('_route' => '_profiler_exception_css')), array (  '_controller' => 'web_profiler.controller.exception:cssAction',));
                }

            }

            if (0 === strpos($pathinfo, '/_configurator')) {
                // _configurator_home
                if (rtrim($pathinfo, '/') === '/_configurator') {
                    if (substr($pathinfo, -1) !== '/') {
                        return $this->redirect($pathinfo.'/', '_configurator_home');
                    }

                    return array (  '_controller' => 'Sensio\\Bundle\\DistributionBundle\\Controller\\ConfiguratorController::checkAction',  '_route' => '_configurator_home',);
                }

                // _configurator_step
                if (0 === strpos($pathinfo, '/_configurator/step') && preg_match('#^/_configurator/step/(?P<index>[^/]++)$#s', $pathinfo, $matches)) {
                    return $this->mergeDefaults(array_replace($matches, array('_route' => '_configurator_step')), array (  '_controller' => 'Sensio\\Bundle\\DistributionBundle\\Controller\\ConfiguratorController::stepAction',));
                }

                // _configurator_final
                if ($pathinfo === '/_configurator/final') {
                    return array (  '_controller' => 'Sensio\\Bundle\\DistributionBundle\\Controller\\ConfiguratorController::finalAction',  '_route' => '_configurator_final',);
                }

            }

        }

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
