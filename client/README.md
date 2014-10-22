Client-side of bus.meran.eu
=============================

The client contains all static html,images, css and javscript of the frontend.
Furthermore it contains openlayers adapted for sasabus and the whole configuration.

If you want to add/change/remove layers you need modify js/sasabus.js

Setup your first client:
------------------------
- Install a web server like apache 
- Install a git-client
- checkout the repository localy with your git-client
- deploy the client folder on your apache


Linux (apt-get):
-----------------
-sudo apt-get install git
-sudo apt-get install apache2
-mkdir myGitRepo
-cd myGitRepo
-git clone https://github.com/tis-innovation-park/realtimebus.git
-cd /var/www/html
-ln -s ~/myGitRepo/realtimebus/client .
-go to localhost/client
