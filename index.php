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
    // echo "<h1>param</h1>";
    // echo "<p>" . $struc_name . "</p>";
    if (!$lib->hasStructureName($struc_name)) {
        $struc_name = null;
    }
}
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>GdsFeel</title>
    <!-- <link rel="stylesheet" href="./css/styles.css"> -->
    <style>
<?php include_once './css/styles.css'; ?>
    </style>
  </head>
  <body>
    <?php
    if ($struc_name) {
        $head = $lib->name . '/' . $struc_name;
    }
    else {
        $head = $lib->name;
        echo "<p> Not Found: " . $struc_name . "</p>";        
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
                echo "<li>" . $el . "</li>", PHP_EOL;
            }
            echo "</ul>", PHP_EOL;
        }
        ?>
      </div>
    </div>
  </body>
</html>
