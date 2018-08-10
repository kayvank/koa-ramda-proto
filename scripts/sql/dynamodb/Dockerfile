FROM openjdk:8-jre

MAINTAINER kayvan.kazeminejad@vevo.com

WORKDIR /var/dynamodb_wd
  RUN wget -O /tmp/dynamodb_local_latest https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz && \
    tar xfz /tmp/dynamodb_local_latest && \
    rm -f /tmp/dynamodb_local_latest

COPY supervisord.conf /etc/supervisord.conf

RUN mkdir -p /var/log/supervisord
ENV VIRTUAL_HOST dynamo.docker
ENV VIRTUAL_PORT 8000

# Main proxy on 8000, dynamo-admin on 8001, dynamodb on 8002
EXPOSE 8000 8001 8002
ENTRYPOINT ["java", "-jar", "DynamoDBLocal.jar"]

VOLUME /var/lib/dynamodb