<?php
  require('./index.php');
  $kirby = kirby();
  $staticSiteGenerator = new D4L\StaticSiteGenerator($kirby);
  $list = $staticSiteGenerator->generate();
  echo json_encode($list, JSON_PRETTY_PRINT);