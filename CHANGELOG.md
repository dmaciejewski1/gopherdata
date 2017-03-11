# Change Log

## gopherdata v0.1.2 (10 Mar 2017)

- Fixes crash found in ```gopher-connect```:

  - The ```runTransaction``` function now will return a ORA-12514 db error without crashing


## gopherdata v0.1.1 (4 Mar 2017)

- Changes ```gopher-connect```:

  - Explicitly sets the oracle driver's auto-commit option to ```true```


## gopherdata v0.1.0 (4 Mar 2017)

- Fixes crash found in ```gopher-response.js```:

  - Both ```dbStatement``` and ```metrics``` response views now handle an "undefined" response from the database


- Changes ```gopher-response.js```:

  - ```error``` message now reads ```error = false``` instead of ```error = {"message:":"No Error!"}```

  - ```network``` is removed from view until a fix can be implemented


- Changes ```gopher.js```:

  - To more accurately reflect it's function,```Gopher.query``` is now called using the following nomenclature:  ```Gopher.runStatement```


- Adds ```CHANGELOG.md``` file

- Updates ```README.md``` file

  - Minor changes



## gopherdata v0.0.1 (23 Feb 2017 - initial release)

**Initial Features Include**:

- **gopher**

  - ```Gopher.run``` (given both transaction and a connection names, finds both transaction and connection configurations (stored in json files) and responds with data returned from that connection and specified transaction)

  - ```Gopher.query``` (given a Database (SQL) statement and a connection (by name), finds the connection configuration (stored in json files) and responds with data returned from that connection and specified Database (SQL) statement)


- **gopher-response**

  - host (returns host system info)

  - connection (returns connection info)

  - dbStatement (returns SQL statement submitted to database)

  - dbResponse (returns database response info)

  - metaData (returns transaction meta data)

  - metrics (returns transaction metrics)

  - error (returns transaction error)


- **gopher-connect**

  - runTransaction (submits a SQL statement into an Oracle Database and receives a response from that database)

  - closeConnection (closes connection with Oracle Database)


- **gopher-tools**

  - stringStartsWithSelect (returns false if SQL Statement does not begin with the word: select)

  - rejectInject (if found, returns an array of forbidden phrases detected in a SQL Statement)

  - sqlQueryBuilder (given a SQL statement, adds changes within the SQL string)

  - isJson (determines whether a string is formatted in JSON or not)

  - fetchInputs (returns the first object that matches the given name from within a group of JSON files)

  - fetchBindVariableNames (returns all bind variable names found within a SQL Statement)

  - setProperties (apply defaults or overrides to transaction)

  - setConnectionString (builds a database connection string)

  - fetchConnectionInputs (takes a connection object and returns Connection Info from a specified javascript file)


- **gopher-time**

  - getDateObject (outputs a timestamp object with a variety of time outputs in both local and UTC time)





