<?php

$HEADER_MAP = [
'HEADER'       => 0,
'BGNLIB'       => 1,
'LIBNAME'      => 2,
'UNITS'        => 3,
'ENDLIB'       => 4,
'BGNSTR'       => 5,
'STRNAME'      => 6,
'ENDSTR'       => 7,
'BOUNDARY'     => 8,
'PATH'         => 9,
'SREF'         => 10,
'AREF'         => 11,
'TEXT'         => 12,
'LAYER'        => 13,
'DATATYPE'     => 14,
'WIDTH'        => 15,
'XY'           => 16,
'ENDEL'        => 17,
'SNAME'        => 18,
'COLROW'       => 19,
'TEXTNODE'     => 20,
'NODE'         => 21,
'TEXTTYPE'     => 22,
'PRESENTATION' => 23,
'SPACING'      => 24,
'STRING'       => 25,
'STRANS'       => 26,
'MAG'          => 27,
'ANGLE'        => 28,
'UINTEGER'     => 29,
'USTRING'      => 30,
'REFLIBS'      => 31,
'FONTS'        => 32,
'PATHTYPE'     => 33,
'GENERATIONS'  => 34,
'ATTRTABLE'    => 35,
'STYPTABLE'    => 36,
'STRTYPE'      => 37,
'ELFLAGS'      => 38,
'ELKEY'        => 39,
'LINKTYPE'     => 40,
'LINKKEYS'     => 41,
'NODETYPE'     => 42,
'PROPATTR'     => 43,
'PROPVALUE'    => 44,
'BOX'          => 45,
'BOXTYPE'      => 46,
'PLEX'         => 47,
'BGNEXTN'      => 48,
'ENDEXTN'      => 49,
'TAPENUM'      => 50,
'TAPECODE'     => 51,
'STRCLASS'     => 52,
'RESERVED'     => 53,
'FORMAT'       => 54,
'MASK'         => 55,
'ENDMASKS'     => 56,
];


$HEADER_INVERT_MAP = [];
foreach ($HEADER_MAP as $key => $value) {
    $HEADER_INVERT_MAP[$value] = $key;
}

function header_symbol(int $value): string {
    global $HEADER_INVERT_MAP;
    return $HEADER_INVERT_MAP[$value];
}

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


function handle_record(array $bytes): void {
    global $HEADER_MAP;
    $rec_type = $bytes[1];
    $data_type = $bytes[2];
    $data = array_slice($bytes, 2);
    var_dump([header_symbol($rec_type), $data]); 
    switch ($rec_type) {
    case $HEADER_MAP['BGNLIB']:
        break;
    }
}

$rec_count = 0;
try {
    $fh = fopen($gdspath, 'rb');
    while (true) {
        $bytes = next_bytearray($fh);
        if (count($bytes) == 0) {
            break;
        }
        handle_record($bytes);
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

var_dump($HEADER_MAP);
