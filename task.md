# Test task

## Table of contents

- [Task 1](#task-1)
- [Task 2](#task-2)
- [Questions](#questions)

## Task 1

Objective: import the dump file into the DB.

### File format

A plain text format representing objects with properties and other nested
objects. The hierarchy is defined by indentation (each level 2 spaces).
The type of each object is named with a capital letter, properties - with a
small letter. The file contains a list of employees (Employee), each with basic
properties (first name, last name, ID). Also, each employee belongs to some
department (Department) and has a list of salaries (Statement) for the year.
The salary is defined by the date and amount (always in USD). An employee may
also have records of charitable contributions (Donation), the contribution
amount can be in any currency. In addition, the file contains the exchange
rates (Rate) for all date-currency pairs that were encountered in the
contributions. It is enough to store the equivalent of contributions in USD
in the database.
The dump file is attached.

## Task 2 (query)

Objective: create an API endpoint that performs the following calculations
in the DB and returns the results. All the calculations must be performed
in one SQL query.

For the employees who donated more than $100 to charity, calculate a one-time
reward equivalent to their contribution from the $10,000 pool.
For example, if an employee sent $200 out of a total of $1,000 donations,
he/she should receive 20% of the $10,000.
If employee contributions are less than $100, the value should be counted
towards the total, but the employee do not receive remuneration.

### Questions

Objective: demonstrate that the design desicions you made were solid by
answering the questions.

1. How to change the code to support different file versions?

Unfortunately there is no information about difference between file versions. I assume the new versions include some new properties,
so there would be a need to add optional properties to parser and DB model

2. How the import system will change if data on exchange rates disappears from
   the file, and it will need to be received asynchronously (via API)?

It can easily be done by replacing parseRates() method by some http request.

3. In the future the client may want to import files via the web interface,
   how can the system be modified to allow this?

The task didn't mention where the dump file is located and how we obtained it.
Thus, if client wants to upload the file, it can be done via the same 'upload' endpoint:
the file is attached to request, than caught by interceptor and stored somewhere on the server and removed after successful upload to DB.
Depending on requirements it is possible to add separate endpoint to upload and validate the file before writting it to DB via separate endpoint.
