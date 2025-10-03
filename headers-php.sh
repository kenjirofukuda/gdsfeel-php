#!/usr/bin/env bash

tr '\r' '\n' <  ~/Nextcloud/gds/calma4/document/STREAM.DC \
    | awk -f headers-php.awk 
