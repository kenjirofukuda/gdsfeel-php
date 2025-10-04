<?php

// DATA TYPE
const NO_DATA   = 0;
const BIT_ARRAY = 1;
const INT2      = 2;
const INT4      = 3;
const REAL4     = 4;
const REAL8     = 5;
const ASCII     = 6;

// RECORD TYPE
const HEADER       = 0;
const BGNLIB       = 1;
const LIBNAME      = 2;
const UNITS        = 3;
const ENDLIB       = 4;
const BGNSTR       = 5;
const STRNAME      = 6;
const ENDSTR       = 7;
const BOUNDARY     = 8;
const PATH         = 9;
const SREF         = 10;
const AREF         = 11;
const TEXT         = 12;
const LAYER        = 13;
const DATATYPE     = 14;
const WIDTH        = 15;
const XY           = 16;
const ENDEL        = 17;
const SNAME        = 18;
const COLROW       = 19;
const TEXTNODE     = 20;
const NODE         = 21;
const TEXTTYPE     = 22;
const PRESENTATION = 23;
const SPACING      = 24;
const STRING       = 25;
const STRANS       = 26;
const MAG          = 27;
const ANGLE        = 28;
const UINTEGER     = 29;
const USTRING      = 30;
const REFLIBS      = 31;
const FONTS        = 32;
const PATHTYPE     = 33;
const GENERATIONS  = 34;
const ATTRTABLE    = 35;
const STYPTABLE    = 36;
const STRTYPE      = 37;
const ELFLAGS      = 38;
const ELKEY        = 39;
const LINKTYPE     = 40;
const LINKKEYS     = 41;
const NODETYPE     = 42;
const PROPATTR     = 43;
const PROPVALUE    = 44;
const BOX          = 45;
const BOXTYPE      = 46;
const PLEX         = 47;
const BGNEXTN      = 48;
const ENDEXTN      = 49;
const TAPENUM      = 50;
const TAPECODE     = 51;
const STRCLASS     = 52;
const RESERVED     = 53;
const FORMAT       = 54;
const MASK         = 55;
const ENDMASKS     = 56;


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


function read_int2(array $bytes): int {
    assert(count($bytes) == 2);
    $result = $bytes[0];
    $result <<= 8;
    $result += $bytes[1];
    if ($result & 0x8000) {
        $result &= 0x7fff;
        $result ^= 0x7fff;
        $result += 1;
        $result = -$result;
    }
    return $result;
}


function read_int4(array $bytes): int {
    assert(count($bytes) == 4);
    for ($i = 0, $result = 0; $i < 4; $i++) {
        $result <<= 8;
        $result += $bytes[$i];
    }
    if ($result & 0x80000000) {
        $result &= 0x7fffffff;
        $result ^= 0x7fffffff;
        $result += 1;
        $result = -$result;
    }
    return $result;
}

const POW_2_56 = 2 ** 56;

function read_real8(array $bytes): float {
    $sign = $bytes[0] & 0x80;
    $exponent = ($bytes[0] & 0x7f) - 64; 
    $mantissa_int = 0;

    for ($i = 1; $i < 8; $i++) {
        $mantissa_int <<= 8;
        $mantissa_int += $bytes[$i];
    }
    $mantissa_float = ($mantissa_int * 1.0 / POW_2_56);
    $result = $mantissa_float * (16 ** $exponent);
    if ($sign)
        $result = -$result;

    return $result;
}

function extract_int2_array(array $bytes): array {
    assert(count($bytes) % 2 == 0);
    $result = [];
    $num_elements = count($bytes) / 2;
    for ($i = 0; $i < $num_elements; $i++) {
        $result[] = read_int2(array_slice($bytes, $i * 2, 2));
    }
    return $result;
}


function extract_int4_array(array $bytes): array {
    assert(count($bytes) % 4 == 0);
    $result = [];
    $num_elements = count($bytes) / 4;
    for ($i = 0; $i < $num_elements; $i++) {
        $result[] = read_int4(array_slice($bytes, $i * 4, 4));
    }
    return $result;
}


function extract_real8_array(array $bytes): array {
    assert(count($bytes) % 8 == 0);
    $result = [];
    $num_elements = count($bytes) / 8;
    for ($i = 0; $i < $num_elements; $i++) {
        $result[] = read_real8(array_slice($bytes, $i * 8, 8));
    }
    return $result;
}


function extract_ascii(array $bytes): string {
    $end = array_key_last($bytes);
    $arr = $bytes;
    if ($bytes[$end] == 0) {  // has padding
        $arr = array_slice($bytes, 0, -1);
    }
    return join(array_map("chr", $arr));
}


function extract_bitmask(array $bytes): int {
    return (extract_int2_array($bytes))[0];
}


function handle_record(array $bytes): void {
    global $HEADER_MAP;
    $rec_type = $bytes[1];
    $data_type = $bytes[2];
    $data = array_slice($bytes, 2);
    assert(count($data) % 2 == 0);
    var_dump([header_symbol($rec_type), $data]);
    $int2_array = [];
    $int4_array = [];
    $ascii = '';
    $bitmask = 0;
    $real8_array = [];
    switch ($data_type) {
    case INT2:
        $int2_array = extract_int2_array($data);
        var_dump($int2_array);
        break;
    case INT4:
        $int4_array = extract_int4_array($data);
        var_dump($int4_array);
        break;
    case REAL8:
        $real8_array = extract_real8_array($data);
        var_dump($real8_array);
        break;
    case BIT_ARRAY:
        $bitmask = extract_bitmask($data);
        break;
    case ASCII:
        $ascii = extract_ascii($data);
        echo $ascii, "\n";
        break;
    }
    switch ($rec_type) {
    case BGNLIB:
        break;
    }
}


function read_stream(string $gdspath): void {
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

}

read_stream($gdspath);

