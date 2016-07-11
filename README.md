# gopher
Develop and organize your recycled database statements and queries to be executed from within a Node.js environment against any one (or all) of your Oracle Database environments from a centralized location using your own named/aliased ***Connections*** and ***Transactions***.

## Why?
* move database development into the middle of the stack
* build, test, maintain, and execute ETL, DML, and DDL statements from outside Oracle
* organize commonly used database *Connections* and *Transactions* into library files
* isolate *Transactions* for use with only specified *Connections*
* abstract away details about database *Transactions* by mapping named commands to information requests
* get feedback about *Transaction* processes
* customize each *Transaction's* output
* integrate Gopher with a web-API and/or with other Node.js modules (such as Express.js)
* integrate Gopher with task management tools/modules such as Grunt or Gulp

## Requirements
* Node.js (works with v0.10.28 through v6.2.2)
* Oracle Instant Client (works with v11.2 through v12.1)

## Contents
|Jump to a section|Section description|
|:-----------|:-----------|
|[Oracle Instant Client Setup](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#oracle-instant-client-setup)| Get up and going with Oracle Instant Client|
|[Gopher Concepts](http://github.com/dmaciejewski1/gopherdata/blob/master/README.md#create-a-simple-demo-application)|A quick reference guide|
|[Setup](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#a-setup)|Setup a basic demo app|
|[Configure](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#b-configure)|Configure some example libraries|
|[Build a Gopher](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#c-build-a-gopher)|Create a basic Gopher|
|[Create a Gopher Schema](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#i-create-a-gopher-schema)|Create a family of Gopher Types|
|[Create Gopher Calls](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#ii-create-gopher-calls)|Put your Gophers to use|

## Oracle Instant Client Setup
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---
### A. Download
   1. Download the following **TWO** Oracle Instant Client Packages (here: http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html ). Make sure to download the correct packages for your system architecture (i.e. 64 bit vs 32 bit)
      * **Instant Client Package - Basic or Basic Lite**: Contains files required to run OCI, OCCI, and JDBC-OCI applications
      * **Instant Client Package - SDK**: Contains additional header files and an example makefile for developing Oracle applications with Instant Client

### B. Install
##### (this demo procedure is for Mac OS X 64bit ONLY using Oracle Instant Client 12.1)
   1. Unzip your Oracle Instant Client files to ```~/oracle```

   ```bash
   unzip instantclient-basic-macos.x64-12.1.0.2.0.zip -d ~/oracle
   unzip instantclient-sdk-macos.x64-12.1.0.2.0.zip -d ~/oracle
   ```
   2. Update your .bashrc file by appending and saving the following block of code:

   ```bash
   ##### Oracle Instant Client 12.1 #####
    export OCI_HOME=~/oracle/instantclient_12_1
    export OCI_LIB_DIR=$OCI_HOME
    export OCI_INC_DIR=$OCI_HOME/sdk/include
    export OCI_INCLUDE_DIR=$OCI_HOME/sdk/include
    export DYLD_LIBRARY_PATH=$OCI_LIB_DIR
   ```
   3. Create the following symbolic links from within your Instant Client directory (e.g. ~/oracle/instantclient_12_1):

   ```bash
   ln -s ~/oracle/instantclient_12_1/libclntsh.dylib.12.1 ~/oracle/instantclient_12_1/libclntsh.dylib
   ln -s ~/oracle/instantclient_12_1/libocci.dylib.12.1 ~/oracle/instantclient_12_1/libocci.dylib
   ```
   4. Restart your Terminal application OR type the following ```source ~/.bashrc```

## Create a Simple Demo Application
 The following instruction has been written to help you set up a basic model for usage called "gopher-demo". Please note that (for simplicity sake) this demo is non-functional as it will not connect you to any real database. It is meant to cover core concepts for usage providing examples that demonstrate how to get started, and how to get the most from this software.

 Just a few concepts...As it pertains to this module:
  * A ***Connection*** is the name of a database's connection configuration (that is, the credentials necessary for connecting to a database)
  * A ***Transaction*** (or *gopher command*) is the name of a database statement (i.e. a DML or DDL string)
  * A ***Gopher*** is a function that is designed to:
   1. retrieve a stored *Transaction*
   2. using a stored *Connection*, execute that *Transaction* within a desired database environment
  * A ***Transaction Library*** is a JSON file that contains a group of named *Transactions* and their configurations.  
  * A ***Connection Library*** is a JSON file that contains a group of named *Connections* and their configurations

### A. Setup
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---
   1. Initialize gopher-demo with npm:

   ```bash
npm init
   ```
   2. After gopher-demo initialization is complete, install the gopherdata module using npm:

   ```bash
npm install gopherdata
   ```
   3. From the main directory, create directories named ***libraries/connection***:

   ```bash
mkdir -p libraries/connection
   ```
   4. From the main directory, create a directory in *libraries* named ***libraries/transaction***:

   ```bash
mkdir libraries/transaction
   ```
   5. From the main directory, create a *Connection Library* named ***finance-connections.json***:

   ```bash
touch libraries/connection/finance-connections.json
   ```
   6. From the main directory, create an Oracle Data Dictionary *Transaction Library* named ***oracle-dictionary.json***:

   ```bash
touch libraries/transaction/oracle-dictionary.json
   ```
   7. From the main directory, create a Development *Transaction Library* named ***finance-reports-2016-DEV.json***:

   ```bash
touch libraries/transaction/finance-reports-2016-DEV.json
   ```   
   8. From the main directory, create an ETL *Transaction Library* named ***finance-reports-2016-ETL-DEV.json***:
   ```bash
touch libraries/transaction/finance-reports-2016-ETL-DEV.json
   ```

### B. Configure
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---   
   1. **CONFIGURE A CONNECTION LIBRARY** : In the example below "finance-Prod", "finance-QA" and "finance-Dev" are the name of database *Connections*. Add the following code to ```./libraries/connection/finance-connections.json```:

   ```json
[
  {"finance-Prod" :{
        "user"                 : "me",
        "password"             : "myProdPassword",
        "host"                 : "databases.arecool.com",
        "port"                 : 12345,
        "service"              : "databases.arecool.com"
  }},
  {"finance-QA" :{
        "user"                 : "me",
        "password"             : "myQAPassword",
        "host"                 : "QAdatabases.arecool.com",
        "port"                 : 12345,
        "service"              : "QAdatabases.arecool.com"
  }},
  {"finance-Dev" :{
        "user"                 : "me",
        "password"             : "myDevPassword",
        "host"                 : "financedatabases.arecooltoo.com",
        "port"                 : 12345,
        "SID"                  : "financedatabases.arecooltoo.com"
  }}
]
   ```
   2. **CONFIGURE AN ORACLE DATA DICTIONARY TRANSACTION LIBRARY**: Here, the process of getting a list of a database's tables can be mapped to a gopher command: "get-db-tables", and likewise, to get a list of table columns: "get-db-table-columns", and database views: get-db-views . Use Gophers to execute *Transactions* from your libraries by name, using a specific *Connection* (by name). Add the following code to ```./libraries/transaction/oracle-dictionary.json```:

   ```json
[
  {"get-db-tables" :{
    "dbStatement"     : "SELECT a.object_name AS \"TABLE\" FROM sys.user_objects a INNER JOIN sys.user_all_tables b ON a.object_name = b.table_name WHERE a.object_type = 'TABLE' ORDER BY b.table_name",
    "zeroRowMessage"  : "No Tables found"
  }},

  {"get-db-table-columns" :{
      "dbStatement"     : "SELECT column_name AS \"COLUMN\" FROM sys.user_tab_columns WHERE lower(table_name) = lower(:tableName)",
      "bindVariables"   : {"tableName":"dual"},
      "zeroRowMessage"  : "Table not found"

  }},

  {"get-db-views" :{
      "dbStatement"     : "SELECT object_name AS \"VIEW\", substr(status, 1, 1) AS status,last_ddl_time,created FROM sys.user_objects WHERE object_type = 'VIEW' ORDER BY object_name",
      "zeroRowMessage"  : "No Views found"

  }}
]
   ```
   3. **CONFIGURE A FINANCE REPORT TRANSACTION LIBRARY**: In the simplified example below, "get-quarterly-report-2016" and "get-annual-report-2016" are  *Transactions* that correspond to a fictitious 2016 Financial Reports Development *Transaction Library*. Here, we want to isolate theses queries in their own library as they are meant for use with development and QA databases (i.e. finance-Dev and finance-QA). Add the following code to ```./libraries/transaction/finance-reports-2016-DEV.json```:

   ```json
[
  {"get-quarterly-report-2016" :{
    "dbStatement"     : "SELECT region, division, storeID, year, quarter, total_sales FROM quarterly_sales_2016 WHERE lower(storeID) = lower(:storeID) AND lower(quarter) = lower(:quarter)) ORDER BY year, quarter",
    "bindVariables"   :{"storeID":null, "quarter":null},
    "zeroRowMessage"  : "Not enough info entered"
  }},

  {"get-annual-report-2016" :{
    "dbStatement"     : "SELECT region, division, storeID, year, quarter, total_sales FROM annual_sales_2014-2016 WHERE lower(storeID) = lower(:storeID) AND lower(year) = lower(:year)",
      "bindVariables"   : {"storeID":null, "year":null},
      "zeroRowMessage"  : "Not enough info entered"

  }}
]
   ```   
   4. **CONFIGURE AN ETL TRANSACTION LIBRARY**: Here we are interested in isolating and mapping ETL processes to gopher commands.   Add the following code to ```./libraries/transaction/finance-reports-2016-ETL-DEV.json```:

   ```json
[
  {"drop-quarterly-sales-2016" :{
    "dbStatement"     : "DROP MATERIALIZED VIEW quarterly_sales_2016"
  }},

  {"build-quarterly-sales-2016" :{
    "dbStatement"     : "CREATE MATERIALIZED VIEW quarterly_sales_2016 BUILD IMMEDIATE REFRESH FORCE ON DEMAND AS SELECT region, division, storeID, year, quarter, total_sales FROM quarterly_sales WHERE year = 2016"
  }},

  {"drop-annual-sales-2014-2016" :{
    "dbStatement"     : "DROP MATERIALIZED VIEW quarterly_sales_2016"
  }},  

  {"build-annual-sales-2014-2016" :{
    "dbStatement"     : "CREATE MATERIALIZED VIEW annual_sales_2014-2016 BUILD IMMEDIATE REFRESH FORCE ON DEMAND AS SELECT region, division, storeID, year, quarter, total_sales FROM annual_sales WHERE year IN (2014,2015,2016)"

  }}
]
   ```      
   5. **ASSOCIATE TRANSACTION LIBRARIES TO SPECIFIC CONNECTIONS**: In this example, the "transactionLibraries" Property for the finance-Prod, finance-QA, and finance-Dev *Connections* have been configured to share the oracle-dictionary.json *Transaction Library*, however, since the finance-reports-2016-DEV.json *Transaction Library* is still in development (and further, is not configured in the finance-Prod *Connection*), it's gopher commands are not functional/accessible when using the finance-Prod *Connection*. Modify ```./libraries/connection/finance-connections.json``` to include links to *Transaction Libraries*:

   ```json
[
  {"finance-Prod" :{
        "user"                 : "me",
        "password"             : "myProdPassword",
        "host"                 : "databases.arecool.com",
        "port"                 : 12345,
        "service"              : "databases.arecool.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary.json",
                                  "./libraries/transaction/finance-reports-2015.json",
                                  "./libraries/transaction/finance-reports-2015-ETL.json"]
  }},

  {"finance-QA" :{
        "user"                 : "me",
        "password"             : "myQAPassword",
        "host"                 : "QAdatabases.arecool.com",
        "port"                 : 12345,
        "service"              : "QAdatabases.arecool.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary.json",
                                  "./libraries/transaction/finance-reports-2015.json",
                                  "./libraries/transaction/finance-reports-2015-ETL.json"
                                  "./libraries/transaction/finance-reports-2016-DEV.json",
                                  "./libraries/transaction/finance-reports-2016-ETL-DEV.json"]
  }},

  {"finance-Dev" :{
        "user"                 : "me",
        "password"             : "myDevPassword",
        "host"                 : "financedatabases.arecooltoo.com",
        "port"                 : 12345,
        "SID"                  : "financedatabases.arecooltoo.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary.json",
                                  "./libraries/transaction/financeSandbox.json",
                                  "./libraries/transaction/finance-reports-2015.json",
                                  "./libraries/transaction/finance-reports-2015-ETL.json"
                                  "./libraries/transaction/finance-reports-2016-DEV.json",
                                  "./libraries/transaction/finance-reports-2016-ETL-DEV.json"]
  }}
]
   ```

### C. Build a Gopher
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---
Create a simple Gopher that uses the same stored *Transaction* against two different databases (from the same common library) to get lists of all tables listed in the Finance Production and Finance Development Databases.

1. From the gopher-demo main directory, create a gopher.js file:
 ```bash

 touch gopher.js
 ```
2. Add the following code to the gopher.js file
 ```js
 "use strict";

 const Gopher = require('gopherdata');

 //Assign Gardens (Gopher vernacular for Db Connection Configurations)
 const GARDENS = ['./libraries/connection/finance-connections.json',
                      './libraries/connection/myDatabase-connections.json'];
/*******************************************************************************
                             Create a generic Gopher         
********************************************************************************/

   var runGopher = function(dbConnection,transactionName,callback){

     // Add Transaction Properties here:
     let transactionPlan = {transaction      : transactionName,
                            outputFormat     : 'array',
                            responseOutput   : ['dbResponse','metaData','metrics']};

     new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
       .run(transactionPlan,
         function(err,res){
           if (err)  {
             return callback(err,res);
           }
           return callback(err,res);
         }
       );
   }
/*******************************************************************************
                             Send Gopher on it's way
********************************************************************************/

  //get a production db table listing
   runGopher('finance-Prod','get-db-tables',
     function(gophErr, gophRes){
       if(gophErr){console.log(gophRes);}
     console.log(gophRes)
     }
   );

   //get a development db table listing
   runGopher('finance-Dev','get-db-tables',
     function(gophErr, gophRes){
       if(gophErr){console.log(gophRes);}
     console.log(gophRes)
     }
   );

 ```

### D. Build a Simple Abstraction
#### I. Create a Gopher schema
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---
 Create a gopher-schema.js file and add links to your *Connection Libraries*, and then build/configure your *Transaction* types
 1. From the gopher-demo main directory, create a gopher-schema.js file:
 ```bash

 touch gopher-schema.js
 ```
 2. Add the following code to the gopher-schema.js file:
 ```js

 "use strict";
  const Gopher = require('gopherdata');

  //Assign Gardens (Gopher vernacular for Db Connection Configurations)
  const GARDENS = ['./libraries/connection/myDatabase-connections.json',
                   './libraries/connection/corporate-connections.json',
                   './libraries/connection/finance-connections.json'];
/*******************************************************************************
    Create Different Gophers (i.e. a Gopher Schema) and Configure their     
    Transaction Properties                                                  
********************************************************************************/

   //--------------------Without Bind Variables--------------------
    exports.run = function(dbConnection,transactionName,callback){
      let transactionPlan = {transaction : transactionName};

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionPlan,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //----------------------With Bind Variables---------------------

    exports.runWBindVariables = function(dbConnection,transactionName,bindVariables,callback){

      let transactionPlan = {
        transaction        : transactionName,
        bindVariables      : bindVariables
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionPlan,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //---------------------------Show SQL---------------------------

    exports.showSql = function(dbConnection,transactionName,callback){

      let transactionPlan = {
        transaction        : transactionName,
        responseOutput     : ['sqlOnly']
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionPlan,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //---------------------------Verbose----------------------------

    exports.runVerbose = function(dbConnection,transactionName,callback){

      let transactionPlan = {
        transaction        : transactionName,
        responseOutput     : ['verbose']
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionPlan,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //------------------------Get Db Tables-------------------------

    exports.getTables = function(dbConnection,callback){

      let transactionPlan = {transaction  : 'get-db-tables'};

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionPlan,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //------------------------Get Db Columns------------------------

    exports.getColumns = function(dbConnection,table,callback){

      let transactionPlan = {
        transaction    : 'get-db-table-columns',
        bindVariables  : {tableName:table}
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionPlan,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //--------------------------Modifiable--------------------------

    exports.runModifiable = function(dbConnection,transactionPlan,callback){

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionPlan,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
           }
         );
     }
```

#### II. Create Gopher Calls:
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---
 1. From the gopher-demo main directory, create a myGopherCalls.js file:
 ```bash

 touch myGopherCalls.js
 ```
 2. Setup the myGopherCalls.js file by adding the following code:
 ```js

 "use strict";
 const gopher = require('./gopher-schema.js');
 let connection = '', // a named connection (configured from within a Connection Library)
     transaction = '', // a named transaction (i.e. a canned DDL/DML statement configured from within a Transaction Library)
     bindVariables = {}, // unique bind variables associated with a transaction (set/configured from within a Transaction Library)
     transactionPlan = {}; // a means by which to override a stored Transaction's default settings

 ```     
 3. **Basic Run** : Append the "run" gopher to myGopherCalls.js to execute a stored *Transaction* using a stored database *Connection*
 ```js

     connection = 'finance-Dev';
     transaction = 'get-db-tables';

     gopher.run(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 4. **Run With Bind Variables** : Append the "runWBindVariables" gopher to myGopherCalls.js to allow bind variables to be used with *Transactions* and returns just the data
 ```js

     connection = 'finance-Prod';
     transaction = 'get-quarterly-report-2016';
     bindVariables = {
       storeID    : '1234',
       quarter    : 3

     };

     gopher.runWBindVariables(connection,transaction, bindVariables,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 5. **View SQL Statement** : Append the "showSql" gopher to myGopherCalls.js to return just the actual SQL statement sent to generate the quarterly report (without the data)
 ```js

     connection = 'finance-Dev';
     transaction = 'get-quarterly-report-2016';
     bindVariables = {
       storeID    : '1234',
       quarter    : 3
     };     

     gopher.showSql(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 6. **Show List of Database Table Names** : Append the "getTables" gopher to myGopherCalls.js, for use as a generic/simplified gopher that returns the Database tables with just a *Connection* (forgoing the need to callout the canned *Transaction* by name "get-db-tables")
 ```js

     connection = 'finance-Prod';

     gopher.getTables(connection,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 7. **Show List of Table Column Names** : Append the "getColumns" gopher to myGopherCalls.js to return  given *Connection*
 ```js

     connection = 'finance-Prod';
     var table = 'quarterly_metrics';

     gopher.getColumns(connection,table,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 8. **Return All Available Information** : Append the "runVerbose" gopher to myGopherCalls.js to return all available information about the *Transaction*; that is, information regarding the: host machine, network, connection, database statement, errors, database response, metadata, and some simple metrics. To set specific outputs, configure the "responseOutput" property in the "transactionPlan" object below (see example 9).
 ```js

     connection = 'finance-Prod';
     transaction = 'get-db-tables';

     gopher.runVerbose(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 9. **Run Transaction as Modifiable** : Append the "runModifiable" gopher to myGopherCalls.js to override a Transaction's defaults. In the example below, the *Transaction Plan* contains all possible properties
 ```js

     connection = 'finance-QA';
     transactionPlan = {
         transaction       :'get-quarterly-report-2016',
         bindVariables     :{
                storeID    : '1234',
                quarter    : 3
                }
         outputFormat      : 'object', // format used for the database output. choices are "array", "object", or "json". if not set/configured, the application default is "json"
        maxRowsReturned   : 200 ,// the number of rows returned from database output. if or not set/configured, the application default is 2000
        zeroRowMessage    : 'No information found for North America Region', // the message returned when nothing is returned. if not set/configured, the application default is "0 rows returned"
        responseOutput    : ['host','network','connection','dbStatement','error','dbResponse','metaData','metrics'], // use any of the following choices, or use ONLY one of the following special commands: "dataOnly", "sqlOnly", or "verbose". if not set/configured, the application default is "dataOnly"
        timeZone          : 'local'// sets the time zone for timestamps returned in the response output information (this will NOT modify times/dates/timestamps within the returned dataset)
     };

     gopher.runModifiable(connectTo,transactionPlan,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
   ```
---
