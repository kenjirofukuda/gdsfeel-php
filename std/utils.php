<?php
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


/**
 * @see https://qiita.com/yama-github/items/ee8c44571b3e6ec4916f
 * @param string $tag_name
 * @param array $attrib
 * @param mixed $content
 * @return string
 */
function html_tag($tag_name, $attrib = array(), $content = null): string {
    if (!$attrib && !$content) {
        return sprintf('<%s>', $tag_name);
    }
    if ($attrib) {
        foreach ($attrib as $k => $v) {
            if ($v === null) {
                $attrib[$k] = sprintf('%s', $k);
            }
            elseif (is_bool($v)) {
                $attrib[$k] = sprintf('%s="%s"', $k, (int) $v);
            }
            elseif ($v === '') {
                unset($attrib[$k]);
            }
            else {
                $attrib[$k] = sprintf('%s="%s"', $k, $v);
            }
        }
    }
    if ($content === null) {
        return sprintf('<%s %s>', $tag_name, implode(' ', $attrib));
    }
    return sprintf(
            '<%s%s>%s</%s>'
            , $tag_name
            , $attrib ? ' ' . implode(' ', $attrib) : ''
            , $content
            , $tag_name
    );
}


function debug_out(mixed $value): string {
    $result = html_tag('pre', null, html_tag('code', null, print_r($value, true)));
    return $result;
}