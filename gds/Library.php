<?php

namespace gds;

require_once 'Structure.php';

/**
 * Description of Library
 *
 * @author kenjiro
 */
class Library {
    public string $name;
    public array $units;
    public array $bgnlib;
    private array $structures = [];
    
    function addStructure(Structure $structure) {
        $this->structures[$structure->name] = $structure;
    }
}

?>