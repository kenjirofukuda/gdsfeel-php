<?php

namespace gds;

require_once 'consts.php';
require_once 'stream.php';
require_once 'Library.php';
require_once 'Structure.php';

class Inform {

    public string $gdspath;
    public ?Library $library = null;
    public ?Structure $structure = null;
    public ?Element $element = null;

    function run(): void {
        $rec_count = 0;
        $fh = null;
        try {
            check_gds_path($this->gdspath);
            $fh = fopen($this->gdspath, 'rb');
            while (true) {
                $bytes = next_bytearray($fh);
                if (count($bytes) == 0) {
                    break;
                }
                $this->handle_record($bytes);
                $rec_count++;
            }
        }
        catch (\Exception $e) {
            echo $e->getMessage(), GDS_EOL;
        }
        finally {
            if (is_resource($fh)) {
                fclose($fh);
            }
        }
        // echo "number of records = $rec_count", GDS_EOL;
    }


    function handle_record(array $bytes): void {
        $rec_type = $bytes[1];
        $data_type = $bytes[2];
        $data = array_slice($bytes, 2);
        assert(count($data) % 2 == 0);
        $int2_array = [];
        $int4_array = [];
        $ascii = '';
        $bitmask = 0;
        $real8_array = [];
        $detail = null;
        switch ($data_type) {
            case INT2:
                $detail = $int2_array = extract_int2_array($data);
                break;
            case INT4:
                $detail = $int4_array = extract_int4_array($data);
                break;
            case REAL8:
                $detail = $real8_array = extract_real8_array($data);
                break;
            case BIT_ARRAY:
                $detail = $bitmask = extract_bitmask($data);
                break;
            case ASCII:
                $detail = $ascii = extract_ascii($data);
                break;
        }
        $detail = one_element_as_atomic($detail);
        $info = [header_symbol($rec_type)];
        if ($data_type != NO_DATA) {
            $info[] = $detail;
        }
        // print_r($info);
        switch ($rec_type) {
            case BGNLIB:
                $this->library = new Library();
                $this->library->bgnlib = $detail;
                break;
            case LIBNAME:
                $this->library->name = $detail;
                break;
            case UNITS:
                $this->library->units = $detail;
                break;
            case ENDLIB:
                break;
            case BGNSTR:
                $this->structure = new Structure();
                break;
            case STRNAME:
                $this->structure->name = $detail;
                break;
            case ENDSTR:
                if ($this->library != null && $this->structure != null) {
                    $this->library->addStructure($this->structure);
                    $this->structure = null;
                }
                break;
            case BOUNDARY:
            case PATH:
            case SREF:
            case AREF:
            case TEXT:
            case NODE:
            case BOX:
                $this->element = new Element();
                $this->element->type = $rec_type;
                break;

            case ELKEY:
                $this->element->elkey = $detail;
                break;
            case XY:
            case LAYER:
            case ELFLAGS:
            case PLEX:
            case DATATYPE:
            case PATHTYPE:
            case TEXTTYPE:
            case NODETYPE:
            case BOXTYPE:
            case STRING:
            case COLROW:
            case STRANS:
            case MAG:
            case PLEX:
            case ANGLE:
            case PRESENTATION:
            case PROPATTR:
            case PROPVALUE:
            case SNAME:
                $this->element->map[header_symbol($rec_type)] = $detail;
                break;

            case ENDEL:
                if ($this->structure != null && $this->element != null) {
                    $this->structure->addElement($this->element);
                    // echo $this->element, GDS_EOL;
                    $this->element = null;
                }
                break;
        }
    }
}

$gdspath = join('/', [__DIR__, '..', 'test.gds']);
if (!file_exists($gdspath)) {
    echo "Not found: $gdspath";
    exit(2);
}

// echo $gdspath, GDS_EOL;

function example_gds_path(): string {
    global $gdspath;
    return $gdspath;
}


function example_std_serialize($lib): void {
    $ser = \serialize($lib);
    echo $ser, GDS_EOL;
    $file = __DIR__ . '/../data.bin';
    echo "[$file]", GDS_EOL;
    $reply = \file_put_contents($file, $ser);
    if (!$reply) {
        echo "Write Fail: $file", GDS_EOL;
    }
    $lib2 = \unserialize(\file_get_contents($file));
    print_r($lib2);
}


$stream_path = $gdspath;
if (php_sapi_name() == 'cli') {
    if ($argc >= 2) {
        $stream_path = $argv[1];
    }
    $inform = new Inform();
    $inform->gdspath = $stream_path;
    $inform->run();
    $lib = $inform->library;
    example_std_serialize($lib);
}
?>
