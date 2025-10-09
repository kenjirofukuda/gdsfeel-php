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
  private int $elkey = 0;

  function addElement(Element $element) {
    $element->elkey = $this->elkey;
    $this->elements[] = $element;
    $this->elkey++;
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
