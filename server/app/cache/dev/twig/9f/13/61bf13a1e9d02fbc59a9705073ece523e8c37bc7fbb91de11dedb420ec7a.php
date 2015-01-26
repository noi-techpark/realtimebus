<?php

/* R3GisRealTimeBusBundle:Map:index.html.twig */
class __TwigTemplate_9f1361bf13a1e9d02fbc59a9705073ece523e8c37bc7fbb91de11dedb420ec7a extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'javascripts' => array($this, 'block_javascripts'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<!DOCTYPE html>
<html>
    <head>
        <title>SASA bus locator</title>
        ";
        // line 5
        $this->displayBlock('javascripts', $context, $blocks);
        // line 9
        echo "        <link rel=\"stylesheet\" href=\"http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/ui-lightness/jquery-ui.css\" type=\"text/css\" media=\"all\" />
        <style>
        .ui-dialog {z-index:1000;}
        </style>
    </head>
    <body>
        <div style=\"width:1024px; height:1024px\" id=\"map\"></div>
        <div id=\"busPopup\" style=\"display:none;\">
            <h3>Linea \${lidname}</h3>
            <p class=\"noData\">Questo autobus non si ferma</p>
            <table>
                <thead>
                    <tr>
                        <th>Prossime fermate</th>
                        <th>Stimato</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>\${ort_ref_ort_name}</td>
                        <td>\${time_est}</td> <!-- temporaneo, non ho ancora i dati sull'orario -->
                    </tr>
                </tbody>
            </table>
        </div>
        <div id=\"stopPopup\" style=\"display:none;\">
            <h3>Fermata \${ort_ref_ort_name}</h3>
            <p class=\"noData\">Non passano autobus qui</p>
            <table>
                <thead>
                    <tr>
                        <th>Prossimi autobus</th>
                        <th>Stimato</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Linea \${lidname}</td>
                        <td>\${bus_passes_at}</td> <!-- temporaneo, non ho ancora i dati sull'orario -->
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
</html>
";
    }

    // line 5
    public function block_javascripts($context, array $blocks = array())
    {
        // line 6
        echo "            <script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js\"></script>
            <script src=\"http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js\"></script>
        ";
    }

    public function getTemplateName()
    {
        return "R3GisRealTimeBusBundle:Map:index.html.twig";
    }

    public function getDebugInfo()
    {
        return array (  80 => 6,  77 => 5,  28 => 9,  26 => 5,  20 => 1,);
    }
}
