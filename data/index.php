<?php
// Block direct access if .htaccess is ignored (e.g. some nginx setups).
http_response_code(403);
exit('Forbidden');
