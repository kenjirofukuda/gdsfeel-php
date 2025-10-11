<?php

namespace gds;

require_once 'Element.php';

/**
 * Description of Structure
 *
 * @author kenjiro
 */
class Structure {

  public string $name;
  public array $elements = [];
  private int $el_seed = 0;

  function addElement(Element $element) {
    $element->elkey = $this->el_seed;
    $this->elements[] = $element;
    $this->el_seed++;
  }


  public function elements(): array {
    return $this->elements;
  }


  public function elementAtElKey(int $elkey): ?Element {
    $result = array_find($this->elements, fn(Element $el) => intval($el->elkey) === intval($elkey));
    return $result;
  }
}


?>
