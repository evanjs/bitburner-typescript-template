#!/usr/bin/env sh
sed -r -i ";s;from '(.+?)';from 'xxxsinx/\1';g" dist/xxxsinx/*.js
