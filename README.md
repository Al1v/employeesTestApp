
## Description

test task

## Installation

```bash
$ docker compose up
```

## Running the app

The app is available on http://localhost:5000

There are 2 main endpoints according to the task:

1. POST: http://localhost:5000/employee/upload - loads employee information from dump file, located in root directory of app to DB.
2. GET:  http://localhost:5000/employee/calculate - calculates one_time_reward according to the task requirements.

## Task questions answers:

1. How to change the code to support different file versions?

There is no information about differences in the mentioned file versions. I suspect the main difference would be appearing of some new parameters.
In such case we need to add conditional parameters to parser and DB models.

2. How the import system will change if data on exchange rates disappears from
   the file, and it will need to be received asynchronously (via API)?

There would be no significant changes: we just replace parseRates() method by some async http request.

3. In the future the client may want to import files via the web interface,
   how can the system be modified to allow this?

It wasn't mentioned in the task how we receive the file. If the file is going to be imported by client, we can add the file upload 
to the 'upload' request, save it using interceptor and remove after successful data upload to DB

P.S. the task didn't mentioned some usual functionality like authorization/authentications, thus, they weren't implemented.



