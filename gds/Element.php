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
  public int $elkey = -1;
  public array $map = [];

  public function __toString(): string {
    $items = [header_symbol($this->type), '(', $this->elkey];
    switch ($this->type) {
    case SREF:
    case AREF:
      $items[] = ',';
      $items[] = "'" . $this->map['SNAME']. "'";
      break;
    case TEXT:
      $items[] = ',';
      $items[] = "'" . $this->map['STRING']. "'";
      break;
    }
    $items[] = ')';
    return join($items);
  }
}

?>
