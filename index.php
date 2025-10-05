<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>GdsFeel</title>
    <!-- <link rel="stylesheet" href="./css/styles.css"> -->
    <style>
      <?php include_once './css/styles.css';?>
    </style>
  </head>
  <body>
    <?php
    require_once './gds/Inform.php';

    use \gds\Inform;

    $inform = new Inform();
    $inform->gdspath = \gds\example_gds_path();
    $inform->run();
    $lib = $inform->library;
    ?>
    <h1><?= $lib->name ?></h1>
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
        $struc_name = filter_input(INPUT_GET, 's', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        if ($struc_name) {
            // echo "<h1>param</h1>";
            // echo "<p>" . $struc_name . "</p>";
            if ($lib->hasStructureName($struc_name)) {
                echo '<ul class="no-bullets nav-list-vivid">', PHP_EOL;
                $struc = $lib->structureNamed($struc_name);
                foreach ($struc->elements() as $el) {
                    echo "<li>" . $el . "</li>", PHP_EOL;
                }
                echo "</ul>", PHP_EOL;
            }
            else {
                echo "<p> Not Found: " . $struc_name . "</p>";
            }
        }
        ?>
      </div>
    </div>
  </body>
</html>
