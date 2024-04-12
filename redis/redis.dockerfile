from debian:bullseye

RUN apt-get update
RUN apt-get install redis-server -y
COPY tools/scripts.sh /tmp/scripts.sh
COPY tools/redis.conf /etc/redis
RUN chmod u+x ./tmp/scripts.sh
#RUN service redis-server start
CMD  ["./tmp/scripts.sh"]
