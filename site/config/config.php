<?php

/**
 * The config file is optional. It accepts a return array with config options
 * Note: Never include more than one return statement, all options go within this single return array
 * In this example, we set debugging to true, so that errors are displayed onscreen. 
 * This setting must be set to false in production.
 * All config options: https://getkirby.com/docs/reference/system/options
 */
return [
    'debug' => true,
    'd4l' => [
        'static_site_generator' => [
          'endpoint' => 'static_site_generator', # set to any string like 'generate-static-site' to use the built-in endpoint (necessary when using the blueprint field)
          'output_folder' => './static', # you can specify an absolute or relative path
          'preserve' => [], # preserve individual files / folders in the root level of the output folder (anything starting with "." is always preserved)
          'base_url' => '/static/', # if the static site is not mounted to the root folder of your domain, change accordingly here
          'skip_media' => false, # set to true to skip copying media files, e.g. when they are already on a CDN; combinable with 'preserve' => ['media']
          'skip_templates' => [], # ignore pages with given templates (home is always rendered)
          'custom_routes' => [] # see below for more information on custom routes
        ]
    ]
];