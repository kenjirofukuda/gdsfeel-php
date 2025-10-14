<?php
include_once('../std/utils.php');
// var_dump(scandir("."));
?>

<ul>
  <?php 
    foreach (glob("*.{php,html}", \GLOB_BRACE) as $filename) {
      echo html_tag('li', null, html_tag('a', ['href' => $filename], "$filename"));
    }
  ?>
</ul>
