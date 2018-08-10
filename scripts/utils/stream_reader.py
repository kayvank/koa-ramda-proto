#!/usr/bin/env python

from __future__ import division

import sys
import os
import json
from boto import kinesis
import time
import argparse
import base64


def get_args():
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('--datacenter', '-d', type=str, default='us-east-1')
    parser.add_argument('--shardid', '-s', type=str, default='shardId-000000000000')
    parser.add_argument('--name', '-n', type=str, default='video-3.0')
    parser.add_argument('--iterator', '-i', type=str, default='LATEST')
    parser.add_argument('--interval', type=float, default=1)
    parser.add_argument('--limit', type=int, default=10)
    parser.add_argument('--key', type=str, default=os.environ['AWS_ACCESS_KEY_ID'])
    parser.add_argument('--keysecret', type=str, default=os.environ['AWS_SECRET_ACCESS_KEY'])

    return parser.parse_args()

def main(args):
    kin = kinesis.connect_to_region(args.datacenter, aws_access_key_id=args.key, aws_secret_access_key=args.keysecret)
    shard_id = args.shardid
    shard_it = kin.get_shard_iterator(args.name, shard_id, args.iterator)['ShardIterator']

    while True:
        result = []
        out = kin.get_records(shard_it, limit=args.limit)
        for o in out['Records']:
            result.append(o['Data'].decode("utf-8"))
            sys.stdout.write('%s\n' % o['Data'])
            jdat = json.loads(o['Data'].decode("utf-8"))
            sys.stdout.write('%s\n' % json.dumps(jdat))
            sys.stdout.flush()
        sys.stdout.write('%s\n' % result)
        sys.stdout.flush()
        shard_it = out['NextShardIterator']
        time.sleep(args.interval)


if __name__ == '__main__':
    main(get_args())
