# flybits-coding-challenge

A simple RESTful API for querying drinks at a coffee shop.

Tools used:

- Express
- Mongoose + MongoDB
- Docker

Key features:

- ability to Create, Read, Update, Delete drinks
- ability to use batch style interface to add multiple drinks at once
- ability to query drinks with specified query strings
- pagination of queries to prevent data blowup
- dockerized for easy deployment

## Quickstart

Option1: Clone/download this repo, then from the project's root directory run the following commands. This essentially builds the docker images locally and spins up 2 containers, one for the app and one for Mongodb. Note that initially the database would be empty, so you need to populate it with some data first.

```shell
# You need port 3000 and 27017 open for webservice and mongo respectively
docker-compose build
docker-compose up
```

Option2: If you don't wish to build the image locally, you can pull a pre-built image from dockerhub.

```shell
docker pull albscui/flybitscoffee
docker-compose up
```

The API should be running on `localhost:3000`, and mongo should be running on `localhost:27017`.

## API endpoints

- `/menu/drinks`: this is where all the logic is happening
- `/menu/drinks/batch`: a batch interface for populating the database with multiple drinks via a single request
- `/menu/drinks/:drinkId`: query a specific drink by its unique `drinkId`

After getting the local service running, try clicking on the postman button to test them out.
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/231df1f4f0af870017c6)

If the button doesn't work, try [this postman link](https://www.getpostman.com/collections/231df1f4f0af870017c6).

### Examples

If postman doesn't work, below are some examples.

### `GET`

- `/menu/drinks`: queries all drinks (default pagesize_limit = 100)
- `/menu/drinks?name=Coffee`: queries drinks called Coffee
- `/menu/drinks?ingredients=Milk`: queries drinks that contains Milk in it
  - Queries for ingredients can be either in lowercase or uppercase.
  - For multiple ingredients either: `/menu/drinks?ingredients=milk&ingredients=Syrup` or `/menu/drinks?ingredients=milk,Syrup`
- `/menu/drinks?field=name,price,size`: filter the results by field names
- `/menu/drinks?available_on=<date>`: get drinks that are available on a specific date
- `/menu/drinks?available_now`: a helper method for getting the drinks that are currently available

#### pagination

- `/menu/drinks?limit=5`: for initial page, returns `<last_id_from_prev_page>`
- `/menu/drinks?limit=5&last_id=<last_id_from_prev_page>`: for the next page 

### `POST`

- `/menu/drinks`: creates a new drink

    Request.body:
    ```json
    {
        "name": "Cappuccino",
        "price": 4.5,
        "size": "M",
        "drink_type": "Expresso",
        "ingredients": ["Milk", "Brewed Expresso"]
    }
    ```
- `/menu/drinks/batch`: creates multiple documents via a single request
    ```json
    [{
        "name": "Caffe latte",
        "price": 5,
        "size": "M",
        "drink_type": "Expresso",
        "ingredients": ["Milk", "Brewed Expresso"]
    },
    {
        "name": "Old Caffe americano",
        "price": 4,
        "size": "S",
        "drink_type": "Expresso",
        "ingredients": ["Water", "Expresso"],
        "start_avail_date": "2008"
    },
    ...
    ]
    ```

### `PUT`

- `/menu/drinks/5a9a4284831d6fc859d0bc57`: updates a drink with id `5a9a4284831d6fc859d0bc57`
    ```json
    {
        "price": <newPrice>,
        "end_avail_date": <newEndAvailabilityDate>,
        ...
    }
    ```

### `DELETE`

- `/menu/drinks/5a9a4284831d6fc859d0bc57`: deletes a drink with id `5a9a4284831d6fc859d0bc57`

## Drink Schema

Most of the properties are simple and straight forward, though some properties have constraints, such as `size` can only be one of `S`, `M`, `L` and can only be uppercase. Notice that `start_avail_date` is by default set to the current date and `end_avail_date` is by default set to the year `2042`, which is just an arbitrarily chosen year far enough into the future. Admittedly, this is a hacky solution, another solution would be to set the value of `end_avail_date` to be `start_avail_date + $SOME_CONSTANT_NUMBER`.

```js
{
    name: String,
    drink_type: {
        type: String,
        enum: ["Water", "Coffee", "Tea", "Expresso"]
    },
    price: Number,
    size: {
        type: String,
        enum: ['S', 'M', 'L'],
        uppercase: true
    },
    start_avail_date: {
        type: Date,
        default: Date.now,
    },
    end_avail_date: {
        type: Date,
        default: new Date("2042")
    },
    ingredients: [ String ]
}
```

## Design decisions

### Why MongoDB

We need to model some form of drinks in a coffee shop but we don't have a set of concrete data requirements. Using SQL would be a bit of a premature optimization because SQL requires us to identify data schema up-front, which could make our system too rigid. What about NoSQL?

A NoSQL database has a couple of advantages:

- **Flexibility:** more flexible and easier to manage than SQL, ideal for projects with evolving data requirements (what if we want to add a new property to drinks in the future?)
- **Manageability:** Mongo's `key=val` pair structure is very intuitive, makes our life easier
- **Scalability:** although not very important for this project, the NoSQL's horizontal scalability via sharding prepares us for an ever growing and potentially very large dataset
- **Performance:** mongo is very fast for simple queries
- Easy to start coding immediately

### Pagination

A linked list is used to implement pagination. The default `_id` object in MongoDB is indexed, and has numerical ordering. The idea is to take advantage of this ordering to do 2 things:

1. Get the `_id` of the last entry in the current page, call it `last_id`
2. Get all the entries with `_id` greatern than `last_id`, limit the page size with `limit`, return new page along with pointer to the next page

## What's next

- The database is not indexed, we can create duplicated drinks, this is partly because I wanted a quick way to populate the database with data and test out pagination. We should index and prevent duplicates in production.
- This is a very simple API and we can try a serverless approach, using a cloud service like AWS Lambda, so we don't need to pay for constant server uptime
- Setup CI and CD
- Integrate this microservice into the company's tech stack
- Orchestrate with Kubernetes
- Get new feature requests from stakeholders
