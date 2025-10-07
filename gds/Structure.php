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


/**
 * Porting of PHP 8.4 function
 *
 * @template TValue of mixed
 * @template TKey of array-key
 *
 * @param array<TKey, TValue> $array
 * @param callable(TValue $value, TKey $key): bool $callback
 * @return ?TValue
 *
 * @see https://www.php.net/manual/en/function.array-find.php
 */
function array_find(array $array, callable $callback): mixed {
    foreach ($array as $key => $value) {
        if ($callback($value, $key)) {
            return $value;
        }
    }
    return null;
}


?>