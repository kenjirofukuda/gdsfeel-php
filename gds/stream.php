<?php

namespace gds;

require_once 'consts.php';

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
    $mantissa_float = $mantissa_int * 1.0 / POW_2_56;
    $result = $mantissa_float * (16 ** $exponent);
    if ($sign) {
        $result = -$result;
    }
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


function one_element_as_atomic(mixed $value): mixed {
    if (is_array($value) && count($value) == 1) {
        return $value[0];
    }
    return $value;
}


function check_gds_path(string $gdspath): void {
    if (!file_exists($gdspath)) {
        throw new \Exception("File not found: $gdspath");
    }
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $reply = finfo_file($finfo, $gdspath);
    if (str_ends_with($reply, 'x-empty')) {
        throw new \Exception("Empty File: $gdspath");
    }
    if (!str_ends_with($reply, 'octet-stream')) {
        // TODO: adhook not strict
        throw new \Exception("Not a GDSII file: $gdspath");
    }
}

?>