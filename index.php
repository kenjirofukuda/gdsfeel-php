<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>GdsFeel</title>
    <style type="text/css">
      #struclist {
        background-color: cyan;
        float: left;
      }
      #elementlist {
        background-color: yellow;
        float: left;
      }
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
    <div id="container">
      <div id="struclist">
        <ul>
          <?php foreach ($lib->structures() as $each) { ?>
              <li><a href="./index.php?s=<?= $each->name ?>">
                  <?= $each->name; ?>
                </a>
              </li>
          <?php } ?>
        </ul>
      </div>

      <div id="elementlist">
        <?php
        $struc_name = filter_input(INPUT_GET, 's', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        if ($struc_name) {
            // echo "<h1>param</h1>";
            // echo "<p>" . $struc_name . "</p>";
            if ($lib->hasStructureName($struc_name)) {
                echo "<ul>", PHP_EOL;
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
