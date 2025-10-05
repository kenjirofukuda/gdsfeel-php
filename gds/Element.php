<?php

namespace gds;

require_once 'consts.php';

/**
 * Description of Element
 *
 * @author kenjiro
 */
class Element implements \Stringable {
    //put your code here
    public int $type;
    
    public function __toString(): string {
        return header_symbol($this->type);
    }
}

?>