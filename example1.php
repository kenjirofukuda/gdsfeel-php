<?php
function example1() {
    foreach (['Aho', 'kaina', 'kenjiro'] as $each) {
        printf("%s\n", $each);
    }
}

function example2() {
    $file = './example1.php';

    if (file_exists($file)) {
        echo "aruyo\n";
    }
    else {
        echo "naiyo\n";
        return 1;
    }
    try {
        $fh = fopen($file, 'r');
        while (($line = fgets($fh))) {
            $line = rtrim($line);
            echo "[$line]\n";
        }
    }
    catch (Exception $e) {
        var_dump(e);
    }
    finally {
        fclose($fh);
    }
    return 0;
}


$gdspath = join('/', [getenv('HOME'), 'Nextcloud', 'gds', 'GDSreader.0.3.2','test.gds']);
if (! file_exists($gdspath)) {
    echo "Not found: $gdspath";
    exit(2);
}
echo $gdspath, "\n";


function get_record_size($fh) {
    $temp = fread($fh, USHORT_SIZE);
    $bytes = unpack('n*', $temp);
    var_dump($bytes);
    $rec_size = $bytes[1] - USHORT_SIZE;
    var_dump($rec_size);
    return $rec_size;
}

function next_bytearray($fh) {
    $rec_size = get_record_size($fh);
    if ($rec_size <= 0) {
        echo "empty record size", "\n";
        return [];
    }
    $temp = fread($fh, $rec_size);
    $bytes = unpack('C*', $temp);
    var_dump($bytes);
    return $bytes;
}

$rec_count = 0;
const USHORT_SIZE = 2;
try {
    $fh = fopen($gdspath, 'rb');
    while (true) {
        $bytes = next_bytearray($fh);
        if (count($bytes) == 0) {
            break;
        }
        $rec_count++;
    }
}
catch (Exception $e) {
    var_dump($e);
}
finally {
    fclose($fh);
}
echo $rec_count, "\n";

// example1();
// example2();
    
?>
