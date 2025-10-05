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
}

?>