<?php
require_once './gds/Inform.php';

use \gds\Inform;

$lib = null;
$ser_file = __DIR__ . '/data.bin';
if (file_exists($ser_file)) {
    $ser = file_get_contents($ser_file);
    $lib = unserialize($ser);
}
else {
    $inform = new Inform();
    $inform->gdspath = \gds\example_gds_path();
    $inform->run();
    $lib = $inform->library;
    $ser = serialize($lib);
    file_put_contents($ser_file, $ser);
}

$struc_name = filter_input(INPUT_GET, 's', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
if ($struc_name) {
    if (!$lib->hasStructureName($struc_name)) {
        $struc_name = null;
    }
}

$elkey = -1;
$structure = null;
$element = null;
if ($struc_name) {
    $structure = $lib->structureNamed($struc_name);
    $elkey = filter_input(INPUT_GET, 'e', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    if ($elkey) {
        $element = $structure->elementAtElKey($elkey);
    }
}
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>GdsFeel</title>
    <link rel="stylesheet" href="./css/styles.css">
  </head>
  <body>
    <?php
    if ($struc_name) {
        $head = $lib->name . '/' . $struc_name;
    }
    else {
        $head = $lib->name;
    }
    ?>

    <h1><?= $head ?></h1>
    <div id="container">
      <div id="struclist" class="scroll_lists" >
        <ul class="no-bullets nav-list-vivid">
          <?php foreach ($lib->structures() as $each) { ?>
              <li><a href="./index.php?s=<?= $each->name ?>">
                  <?= $each->name; ?>
                </a>
              </li>
          <?php } ?>
        </ul>
      </div>

      <div id="elementlist"  class="scroll_lists">
        <?php
        if ($struc_name) {
            echo '<ul class="no-bullets nav-list-vivid">', PHP_EOL;
            $struc = $lib->structureNamed($struc_name);
            foreach ($struc->elements() as $el) {
                $attr = [];
                $attr['s'] = $struc_name;
                $attr['e'] = $el->elkey;
                echo '<li><a href="./index.php?' . http_build_query($attr) . '">' . $el . "</a></li>", PHP_EOL;
            }
            echo "</ul>", PHP_EOL;
        }
        ?>
      </div>

      <div id="elementinspector">
        <pre><code>
        <?php
          if ($element) {
              echo print_r($element);
          }
        ?>
        </code></pre>
      </div>
    </div>
  </body>
</html>
