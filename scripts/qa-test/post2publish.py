#!/usr/bin/env python

import json
import requests

with open('../../test/data/api/patch_video.json') as json_file:
    json_data = json.load(json_file)

url = 'https://cs-publish-api.vevodev.com/video/USRV81701431'
url = 'http://localhost:3000/video/USRV81701431'

headers = {'Content-Type' : 'application/json'}
r = requests.patch(
    url,
    data=json.dumps(json_data),
    headers=headers,
    verify=False)
print '-------------'
print r.status_code
print r.headers
print r.text
