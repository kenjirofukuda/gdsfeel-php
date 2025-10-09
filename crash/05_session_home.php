<?php
session_start();
if (empty($_SESSION['username']) || empty($_SESSION['password'])) {
    header('Location: ./04_session_login.php');
    exit;
}

?>


<?php
include_once('../std/utils.php');

echo html_tag('H1', null, 'Home') . '<br>';

echo html_tag('h2', null, '$_SESSION') . '<br>';
echo debug_out($_SESSION, true);

echo html_tag('a', ['href' => './04_session_login.php'], 'Logout');



?>