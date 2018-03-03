# flybits-coding-challenge

A simple RESTful API for querying drinks at a coffee shop.

Tools used:

- Express
- MongoDB
- Docker

## Quickstart

```shell
docker-compose up
```

## API endpoints

- `/menu/drinks`: this is where all the logic is happening

## Examples

`GET` `localhost:3000/menu/drinks`

## Design decisions

### Why MongoDB

For this challenge, we only needed to model a drink, so we don't really need a relational database to model various relationships between different objects. What about NoSQL then?

A NoSQL database has a couple of advantages:

- a bit more flexible and easier to manage
- the `key=val` pair structure is very intuitive
- makes modeling drinks easy (just a bunch of key=val pairs)
- MongoDB is free, and there are lots of documentation online
- easy to implement pagination