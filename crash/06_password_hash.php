<?php
$alogs = [
    'PASSWORD_DEFAULT' => PASSWORD_DEFAULT,
    'PASSWORD_BCRYPT' => PASSWORD_BCRYPT,
    'PASSWORD_ARGON2I' => PASSWORD_ARGON2I,
    'PASSWORD_ARGON2ID' => PASSWORD_ARGON2ID,
];

echo '<h1>password_hash</h1>';

echo '<ul>';
foreach ($alogs as $key => $value) {
    $result = password_hash('1234', $value);
    echo '<li>' . $result . '</li>';
}
echo '</ul>';
