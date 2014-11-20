Getting started with the Realtime Bus Data Server
=================================================

Welcome to the Realtime Bus Data Server

1) Requirements
----------------------------------

The application is developed on Linux. For any other OS, your mileage may vary.

You'll need at least 4GB RAM.

PostgreSQL database (tested with >= 9.1). Connection pooling is definitely a plus. 
PostGIS (tested with >= 1.5)
PHP (required >= 5.3). A code cache, as APC or the Optimzer Plus, coming with PHP 5.5 makes sense.
MapServer (>= 5.6) together with PHP MapScript are needed.
A web server, able to run PHP is needed. 


2) Setting up the data base 
-------------------------------------

A PostGIS database must be initialized. Details on this can be found in the official PostGIS documentation, [3] 
The database schema can be found in dataserver/SQL/realtimebus-schema.sql.
If you have any detailed geometry for you bus route segments, defined as the exact geometry for going from a bus
stop to the next one, insert these into the table ort_edges.  

3) Install the Symfony modules
--------------------------------

The Symfony environment can be initialized with

```
cd dataserver/
php composer.phar install
```

Further details can be found in [2] and [3]. 

Add the project specific parameters from `dataserver/app/config/parameters.yml.sample` to 
`dataserver/app/config/parameters.yml.sample`, as created by the Symfony installation process.

Set up the web server and test you installation, using the standards API. 

4) Import the VDV data

VDV data can be imported with

```
php app/console vdv:import_data DIRECTORY_WITH_VDV_DATA
```
Once the VDV time table has been imported, data can be sent to http://MY_HOST/receiver by POSTing the appropriate JSON
datagram.

Enjoy!

[1]:  http://postgis.net/documentation
[2]:  http://symfony.com/doc/2.3/book/installation.html
[3]:  http://getcomposer.org/
