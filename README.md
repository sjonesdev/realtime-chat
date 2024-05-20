# realtime-chat

Realtime chat app backend (frontend WIP)

## Requirements

-   Java 17
-   Docker
-   Maven

## Kafka Setup

-   `docker pull apache/kafka:3.7.0`
-   `docker run -p 9092:9092 apache/kafka:3.7.0`
-   Can download kafka 3.7.0 [here](https://kafka.apache.org/downloads) if you want to be able to run the scripts and stuff or run it not through docker

## Postgres Setup

-   `docker run -p 5432:5432 --name chat-postgres -e POSTGRES_PASSWORD=password -d postgres`
-   Note you can attach a shell or bash process to the postgres docker container and run `psql postgres postgres`, which will log you into the database with a console.

## Cassandra Setup

-   `docker network create cassandra`
-   `cd chatstream/src/main/resources`
-   Build docker image from dockerfile that turns on experimental SASI index feature: `docker build --tag cassandra_exp .`
-   `docker run --rm -d --name cassandra --hostname cassandra --network cassandra -p 9042:9042 cassandra_exp`
-   `docker run --rm --network cassandra -v "$(pwd)/data.cql:/scripts/data.cql" -e CQLSH_HOST=cassandra -e CQLSH_PORT=9042 -e CQLVERSION=3.4.6 nuvo/docker-cqlsh`
-   `docker run --rm -it --network cassandra nuvo/docker-cqlsh cqlsh cassandra 9042 --cqlversion='3.4.6'`
-   verify seed data with queries

### Cleanup

-   `docker kill cassandra`
-   `docker network rm cassandra`
