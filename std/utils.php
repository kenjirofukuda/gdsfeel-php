<?php

/**
 * @see https://qiita.com/yama-github/items/ee8c44571b3e6ec4916f
 * @param type $tag_name
 * @param type $attrib
 * @param type $content
 * @return type
 */
function html_tag($tag_name, $attrib = array(), $content = null) {
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

