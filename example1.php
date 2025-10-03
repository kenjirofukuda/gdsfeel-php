<?php
foreach (['Aho', 'kaina', 'kenjiro'] as $each) {
    printf("%s\n", $each);
}

$file = './example1.php';

if (file_exists($file)) {
    echo "aruyo\n";
}
else {
    echo "naiyo\n";
    exit(1);
}

$fh = fopen($file, 'r');
while (($line = fgets($fh))) {
    $line = rtrim($line);
    echo "[$line]\n";
}
fclose($fh);

$gdspath = join('/', [getenv('HOME'), 'Nextcloud', 'gds', 'GDSreader.0.3.2','test.gds']);
echo $gdspath, "\n";
if (! file_exists($gdspath)) {
    echo "Not found: $gdspath";
    exit(2);
}
$fh = fopen($gdspath, 'r');
while (true) {
    break;
}
fclose($fh);



?>
