<?php

namespace gds;

const GDS_EOL   = \PHP_EOL;

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

?>
