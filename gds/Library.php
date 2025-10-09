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
    
  public array $structures = [];
    
  function addStructure(Structure $structure) {
    $this->structures[$structure->name] = $structure;
  }
    
  function structures(): array {
    return $this->structures;
  }
    
  function hasStructureName(string $name): bool {
    return array_key_exists($name, $this->structures);
  }
    
  function structureNamed(string $name): ?Structure {
    if ($this->hasStructureName($name)) {
      return $this->structures[$name];
    }
    return null;
  }
    
}

?>
