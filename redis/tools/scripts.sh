#!/bin/bash

exec  redis-server --daemonize no --port 6379 --protected-mode no #--requirepass "root"