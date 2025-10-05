<?php

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Scripting/PHPClass.php to edit this template
 */

namespace gds;


require_once 'Element.php';

/**
 * Description of Structure
 *
 * @author kenjiro
 */
class Structure {
    public string $name;

    private array $elements = [];
    
    function addElement(Element $element) {
        $this->elements[] = $element;
    }
}

?>