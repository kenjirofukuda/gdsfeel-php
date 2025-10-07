<?php
require_once './std/utils.php';
require_once './gds/Inform.php';
require_once './prefs.php';

use \gds\Inform;

$lib = null;
$ser_file = __DIR__ . '/data.bin';
if ($prefs['force_inform']['value'] === true) {
    unlink($ser_file);
}
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
    if (is_numeric($elkey)) {
        $elkey = intval($elkey);
        $element = $structure->elementAtElKey($elkey);
    }
}
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>GdsFeel2</title>
    <link rel="stylesheet" href="./css/styles.css">
    <?php include_once './partial/header_scripts.php'; ?>
    <script src="canvas.js"></script>
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

    <div id="prefs">
      <?=
      html_tag('form', ['action' => '', 'method' => 'post']
              , join([prefs_contents(),
          html_tag('div', null,
                  html_tag('input', ['type' => 'submit', 'value' => 'Save']))]));
      ?>
    </div>

    <h1><?= $head ?></h1>
    <div id="container" class="container">
      <div id="struclist" class="scroll_lists" >
        <ul class="no-bullets nav-list-vivid">
          <?php foreach ($lib->structures() as $each) { ?>
              <?php
              $li_class = '';
              if ($each->name == $struc_name) {
                  $li_class = 'selected';
              }
              ?>
              <li class="<?= $li_class ?>">
                <a class="<?= $li_class ?>" href="./index.php?s=<?= $each->name ?>">
                  <?= $each->name ?>
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
                $li_class = '';
                if ($element && $el->elkey == $elkey) {
                    $li_class = 'selected';
                }
                $attr = [];
                $attr['s'] = $struc_name;
                $attr['e'] = $el->elkey;
                echo html_tag('li', ['class' => $li_class],
                        html_tag('a', [
                    'class' => $li_class,
                    'href' => './index.php?' . http_build_query($attr)],
                                $el)), PHP_EOL;
            }
            echo "</ul>", PHP_EOL;
        }
        ?>
      </div>

      <?php if (shows_element_inspector()) : ?>
          <div id="elementinspector">
            <pre><code>
                <?= print_r($element) ?>
                    </code></pre>
          </div>
      <?php endif; ?>

      <div id="canvas_container" class="fills-remaining-width">
        <?php include_once './partial/command_buttons.php'; ?>
        <?php include_once './partial/coordinate_view.php'; ?>
        <canvas></canvas>
      </div>
      
      <script>
          const container = document.getElementById('canvas_container');
          const canvas = document.querySelector('canvas');
          const ctx = canvas.getContext('2d');

          draw();
          function draw() {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            ctx.fillStyle = 'blue';
            ctx.fillRect(10, 20, 150, 250);
          }
          
          window.addEventListener('resize', () => {           
            draw();
          });


      </script> 


    </div>
  </body>
</html>

<?php

function shows_element_inspector(): bool {
    global $prefs, $element;
    return $prefs['dump_selected_element']['value'] === true && $element;
}
?>