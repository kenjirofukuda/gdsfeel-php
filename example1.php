<?php

$gdspath = join('/', [getenv('HOME'), 'Nextcloud', 'gds', 'GDSreader.0.3.2','test.gds']);
if (! file_exists($gdspath)) {
    echo "Not found: $gdspath";
    exit(2);
}
echo $gdspath, "\n";

const USHORT_SIZE = 2;

function get_record_size($fh): int {
    $temp = fread($fh, USHORT_SIZE);
    $bytes = unpack('n*', $temp);
    $rec_size = $bytes[1] - USHORT_SIZE;
    return $rec_size;
}

function next_bytearray($fh): array {
    $rec_size = get_record_size($fh);
    if ($rec_size <= 0) {
        echo "empty record size", "\n";
        return [];
    }
    $temp = fread($fh, $rec_size);
    $bytes = unpack('C*', $temp);
    return $bytes;
}

$rec_count = 0;
try {
    $fh = fopen($gdspath, 'rb');
    while (true) {
        $bytes = next_bytearray($fh);
        if (count($bytes) == 0) {
            break;
        }
        $rec_type = $bytes[1];
        $data_type = $bytes[2];
        $data = array_slice($bytes, 2);
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

?>
