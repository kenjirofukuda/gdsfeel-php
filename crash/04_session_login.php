<?php
session_start();

include_once('../std/utils.php');
?>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <link rel="stylesheet" href="./crash.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script>
    function checkInput(e) {
      console.log(e);
      $('#submit').attr('disabled', $('#username').val().length == 0 || $('#password').val().length == 0);
    }

    function loadIt() {
      $('#username').on('input', checkInput);
      $('#password').on('input', checkInput);
    };
  </script>
  <link rel="">
</head>

<body onload="loadIt()">
  <h1>Login</h1>
  <?php if (false) : ?>
    <?= html_tag('h2', null, '$_SESSION') ?>
    <?= debug_out($_SESSION, true) ?>
  <?php endif; ?>
  <form action="" method="post">
    <table>
      <tbody>
        <tr>
          <td class="right"><label for="username">User name:</label></td>
          <td><input type="text" name="username" id="username"></td>
        </tr>
        <tr>
          <td class="right"><label for="password">Password:</label></td>
          <td><input type="password" name="password" id="password"></td>
        </tr>
      </tbody>
    </table>
    <input type="submit" value="Login" id="submit" disabled="true">
  </form>
</body>
</html>


<?php
$un_reply = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$ps_reply = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
if (false) {
  $un_reply = $_POST['username'];
  $ps_reply = $_POST['password'];;
  echo print_r($un_reply, true) . '<br>';
  echo print_r($ps_reply, true) . '<br>';
  echo debug_out($_POST, true) . '<br>';
}
if (!empty($un_reply) && !empty($ps_reply)) {
  // TODO: move to conf
  $MY_HASH = '$2y$10$lwG2FtxvPTlebqecBCMFTOLgPCq1PvygQEyo9QnI.NQoEpfu2GJ.W';
  if ($un_reply == 'kenjiro' && password_verify($ps_reply, $MY_HASH)) {
    $_SESSION['username'] = $un_reply;
    $_SESSION['password'] = $ps_reply;
    unset($_POST['username']);
    unset($_POST['password']);
    header('Location: ./05_session_home.php');
    exit;
  } else {
    echo 'Incorrect Account !' . '<br>';
    unset($_POST['username']);
    unset($_POST['password']);
  }
}
if (false) {
  echo '<h1>kakunin</h1>' . '<br>';

  echo print_r($un_reply, true) . '<br>';
  echo print_r($ps_reply, true) . '<br>';
  echo print_r($_POST, true) . '<br>';
}
?>
