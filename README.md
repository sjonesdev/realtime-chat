## Cassandra Setup

-   `docker pull cassandra:latest`
-   `docker network create cassandra`
-   `docker run --rm -d --name cassandra --hostname cassandra --network cassandra -p 9042:9042 cassandra`
-   `cd chatstream/src/main/resources`
-   `docker run --rm --network cassandra -v "$(pwd)/data.cql:/scripts/data.cql" -e CQLSH_HOST=cassandra -e CQLSH_PORT=9042 -e CQLVERSION=3.4.6 nuvo/docker-cqlsh`
-   `docker run --rm -it --network cassandra nuvo/docker-cqlsh cqlsh cassandra 9042 --cqlversion='3.4.6'`
-   verify seed data with queries

### Cleanup

-   `docker kill cassandra`
-   `docker network rm cassandra`
