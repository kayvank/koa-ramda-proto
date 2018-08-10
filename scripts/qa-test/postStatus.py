#!/usr/bin/env python

import json
import requests

with open('../../test/data/stream/video30.json') as json_file:
    json_data = {
        'isrc': 'ert120',
        'youtubeId': 'someid',
        'assetId': 'someString',
        'status': 'completed',
        'errors': []
        }

url = 'http://cs-publish-api.vevodev.com/video/USUMV1600691'
url = 'http://localhost:3000/publish/status/youtube/USUMV1600691'
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
