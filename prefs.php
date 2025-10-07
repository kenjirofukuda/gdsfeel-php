<?php

$prefs = [
    'force_inform' => [
        'key' => 'fi',
        'caption' => 'force inform',
        'value' => false
    ],
    'dump_selected_element' => [
        'key' => 'de',
        'caption' => 'dump selected element',
        'value' => false
    ],
];


$prefs_ser_path = __DIR__ . '/prefs.bin';
if (file_exists($prefs_ser_path)) {
    $ser_bin = file_get_contents($prefs_ser_path);
    $prefs = unserialize($ser_bin);
}

$de_reply = filter_input(INPUT_POST, 'de', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$fi_reply = filter_input(INPUT_POST, 'fi', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

if ($de_reply || $fi_reply) {
    $prefs['dump_selected_element']['value'] = $de_reply == 'on';
    $prefs['force_inform']['value'] = $fi_reply == 'on';
    $ser_bin = serialize($prefs);
    file_put_contents($prefs_ser_path, $ser_bin);
}

function prefs_contents(): string {
    global $prefs;
    $result = [];
    $result[] = '<fieldset>';
    $result[] = html_tag('legend', null, 'Preferences');
    foreach ($prefs as $key => $value) {
        $result[] = '<div>';
        $attr = ['type'=>'hidden', 'id'=>$key, 'name' => $value['key'], 'value' => 'off'];
        $result[] = html_tag('input', $attr);
        $attr['type'] = 'checkbox';
        $attr['value'] = 'on';        
        if ($prefs[$key]['value'] === true) {
            $attr['checked'] = null;
        }
        $result[] = 
                html_tag('input', $attr, 
                html_tag('label', ['for'=>$key], $value['caption']));
        $result[] = '</div>';
    }
    $result[] = '</fieldset>';
    return join($result);
}



?>