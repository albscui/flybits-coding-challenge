# flybits-coding-challenge

A simple RESTful API for querying drinks at a coffee shop.

Tools used:

- Express
- MongoDB
- Docker

## Quickstart

Option1: Clone this repo, then from the project's root directory run the following commands. This essentially builds the docker images locally and spins up 2 containers, one for the app and one for mongodb.

```shell
docker-compose build
docker-compose up
```

Option2: If you don't wish to build the image locally, you can run:

```shell
docker pull albscui/flybitscoffee
docker-compose up
```

## API endpoints

- `/menu/drinks`: this is where all the logic is happening
- `/menu/drinks/batch`: for populating the database with some sample data batch-style
- `/menu/drinks/:drinkId`: query a specific drink by its unique `drinkId`

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/231df1f4f0af870017c6)

If the button doesn't work, try [this postman link](https://www.getpostman.com/collections/231df1f4f0af870017c6).

### Examples

### `GET`

- `/menu/drinks` queries all drinks (default pagesize is 100 entries)
- `/menu/drinks?name=Coffee` queries drinks called Coffee
- `/menu/drinks?ingredients=Milk` queries drinks that contains Milk in it

### `POST`

- `/menu/drinks` creates a new drink

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
- `/menu/drinks/batch` creates multiple entries batch-style
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
    {
        "name": "Caffe americano",
        "price": 4,
        "size": "S",
        "drink_type": "Expresso",
        "ingredients": ["Water", "Expresso"]
    },
    {
        "name": "Coffee",
        "price": 2.5,
        "size": "M",
        "drink_type": "Coffee",
        "ingredients": ["Coffee"]
    },
    {
        "name": "Green tea",
        "price": 3,
        "size": "L",
        "drink_type": "Tea",
        "ingredients": ["Water", "Tea"]
    },
    {
        "name": "Cappuccino",
        "price": 4.5,
        "size": "L",
        "drink_type": "Expresso",
        "ingredients": ["Milk", "Brewed Expresso"]
    }
    ]
    ```

### `PUT`

- `/menus/drinks/5a9a4284831d6fc859d0bc57` updates a drink with id `5a9a4284831d6fc859d0bc57`
    ```json
    {
        "price": <newPrice>,
        "end_avail_date": <newEndAvailabilityDate>,
        ...
    }
    ```

### `DELETE`

- `/menu/drinks/5a9a4284831d6fc859d0bc57` deletes a drink with id `5a9a4284831d6fc859d0bc57`

## Database Schema

The `Drink` schema is a ODM that models our drinks. Most of the properties are simple and straight forward, though some properties have constraints, such as `size` can only be one of `S, M, L` and can only be uppercase. Notice that `start_avail_date` is by default set to the current date and `end_avail_date` is by default set to the year `2042`, which is just an arbitrarily chosen year far enough into the future. Another solution would be to set the value of `end_avail_date` to be `start_avail_date + $SOME_CONSTANT_NUMBER`.

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

For this challenge, we only needed to model a drink, so we don't really need a relational database to model various relationships between different objects. What about NoSQL then?

A NoSQL database has a couple of advantages:

- a bit more flexible and easier to manage
- the `key=val` pair structure is very intuitive
- makes modeling drinks easy (just a bunch of key=val pairs)
- MongoDB is free, and there are lots of documentation online
- easy to implement pagination