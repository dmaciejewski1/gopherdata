# gopher
Develop and organize your canned database statements and queries (within a Node.js platform) so that can be executed against any one (or all) of your Oracle Database environments from your own centralized libraries.

## Summary
Access stored database transactions/SQL queries and run them against multiple Oracle databases from your own centralized library files (stored in json format). Gopher helps keep track of your Database *Connection* and *Transaction* configurations while giving you data formatting options, and feedback about the process.

## Usage
Build and Configure Gophers to:
* facilitate *Connections* and *Transactions* with Oracle databases
* organize and maintain *Connection* and *Transaction* information in (json) library files
* abstract away details about information requests
* maintain SQL queries from outside Oracle
* integrate the Gopher framework with web-API development and/or with other Node.js modules (such as Express.js)

## Requirements
* Node.js (works with v0.10.28 through v6.2.2)
* Oracle Instant Client (works with v11.2 through v12.1)

## Contents
|Jump to a section...|
|:-----------|
|[Oracle Instant Client Setup](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#oracle-instant-client-setup)|
|[Setup](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#a-setup)|
|[Configure](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#b-configure)|
|[Build a Gopher](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#c-build-a-gopher)|
|[Create a Gopher Schema](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#i-create-a-gopher-schema)|
|[Create Gopher Calls](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#ii-create-some-gopher-calls)|

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
 This will set up a basic (non-functional) model called "gopher-demo" (Use to create gopher development patterns)
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
   3. From the main directory, create directories named "libraries/connection":

   ```bash
mkdir -p libraries/connection
   ```
   4. From the main directory, create a directory in "libraries" named "libraries/transaction":

   ```bash
mkdir libraries/transaction
   ```
   5. From the main directory, create a *Connection Library* (file) named finance-connections.json:

   ```bash
touch libraries/connection/finance-connections.json
   ```
   6. From the main directory, create a *Transaction Library* (file) named oracle-dictionary-transactions.json:

   ```bash
touch libraries/transaction/oracle-dictionary-transactions.json
   ```

### B. Configure
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---   
   1. **CONFIGURE A CONNECTION LIBRARY** : In the example below "finance-Prod" and "finance-Dev" are the name of database *Connections*. Add the following code to ```./libraries/connection/finance-connections.json``` and save:

   ```json
[
  {"finance-Prod" :{
        "user"                 : "me",
        "password"             : "myProdPassword",
        "host"                 : "databases.arecool.com",
        "port"                 : 12345,
        "service"              : "databases.arecool.com"
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
   2. **CONFIGURE A TRANSACTION LIBRARY**: In the example below, "get-Tables" and "get-Columns" are *Transactions* with configurable default properties. A gopher will be instructed/configured to execute a specific *Transaction* using a specific *Connection*. Add the following code to ```./libraries/transaction/oracle-dictionary-transactions.json``` and save:

   ```json
[
  {"get-Tables" :{
    "dbStatement"     : "SELECT a.object_name AS \"TABLE\" FROM sys.user_objects a INNER JOIN sys.user_all_tables b ON a.object_name = b.table_name WHERE a.object_type = 'TABLE' ORDER BY b.table_name",
    "zeroRowMessage"  : "No Tables found"
  }},
  {"get-Columns" :{
      "dbStatement"     : "SELECT column_name AS \"COLUMN\" FROM sys.user_tab_columns WHERE lower(table_name) = lower(:tableName)",
      "bindVariables"   : {"tableName":"dual"},
      "zeroRowMessage"  : "No columns found"

  }}
]
   ```
   3. **ASSOCIATE TRANSACTION LIBRARIES TO SPECIFIC CONNECTIONS**: In the example below, *Transaction Libraries* are linked to specific *Connections* so when necessary, commonly used *Transactions* can be shared with multiple database *Connections* (from a single *Transaction Library*). In this example (found in ```./libraries/connection/finance-connections.json```), the "transactionLibraries" Property for the finance-Prod and finance-Dev *Connections* have both been set to use *Transactions* from the ```./libraries/transaction/oracle-dictionary-transactions.json``` library:

   ```json
[
  {"finance-Prod" :{
        "user"                 : "me",
        "password"             : "myProdPassword",
        "host"                 : "databases.arecool.com",
        "port"                 : 12345,
        "service"              : "databases.arecool.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary-transactions.json",
                                  "./libraries/transaction/finance-reports-2015.json",
                                  "./libraries/transaction/finance-web-application.json"]
  }},
  {"finance-Dev" :{
        "user"                 : "me",
        "password"             : "myDevPassword",
        "host"                 : "financedatabases.arecooltoo.com",
        "port"                 : 12345,
        "SID"                  : "financedatabases.arecooltoo.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary-transactions.json",
                                  "./libraries/transaction/financeSandbox.json",
                                  "./libraries/transaction/finance-reports-2016-DEV.json",
                                  "./libraries/transaction/finance-reports-2015.json",
                                  "./libraries/transaction/finance-web-application.json"]
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
     let transactionPlan = {transaction : transactionName};

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
   runGopher('finance-Prod','get-Tables',
     function(gophErr, gophRes){
       if(gophErr){console.log(gophRes);}
     console.log(gophRes)
     }
   );

   //get a development db table listing
   runGopher('finance-Dev','get-Tables',
     function(gophErr, gophRes){
       if(gophErr){console.log(gophRes);}
     console.log(gophRes)
     }
   );

 ```

### D. Build a simple abstraction
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

      let transactionPlan = {transaction  : 'get-Tables'};

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
        transaction    : 'get-Columns',
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

#### II. Create some gopher calls:
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
 var connection = '', // a named connection (configured from within a Connection Library)
     transaction= '', // a named transaction (i.e. a canned DDL/DML statement configured from within a Transaction Library)
     bindVariables = {}, // unique bind variables associated with a transaction (set/configured from within a Transaction Library)
     transactionPlan = {}; // a means by which to override a stored Transaction's default settings

 ```     
 3. **Basic Run** : Append the "run" gopher to myGopherCalls.js to execute a stored *Transaction* using a stored database *Connection*
 ```js

     connection = 'finance-Dev';
     transaction = 'get-Tables';

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
     transaction = 'get-quarterly-report';
     bindVariables = {
       region     : 'North America',
       division   : 'Sales',
       storeID    : '1234'

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

     connection = 'finance-Prod';
     transaction = 'get-quarterly-report';
     bindVariables = {
       region     : 'North America',
       division   : 'Sales',
       storeID    : '1234'

     };     

     gopher.showSql(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 6. **Show List of Database Table Names** : Append the "getTables" gopher to myGopherCalls.js, for use as a generic/simplified gopher that returns the Database tables with just a *Connection* (forgoing the need to callout the canned *Transaction* by name "get-Tables")
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
     transaction = 'get-Tables';

     gopher.runVerbose(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 9. **Run Transaction as Modifiable** : Append the "runModifiable" gopher to myGopherCalls.js to override a Transaction's defaults. In the example below, the *Transaction Plan* contains all possible properties
 ```js

     connection = 'finance-Prod';
     transactionPlan = {
         transaction       :'quarterly-report'
        ,bindVariables     :{ region     : 'North America',
                              division   : 'Sales',
                              storeID    : '1234'}
        ,outputFormat      : 'object' // format used for the database output. choices are "array", "object", or "json". if not set/configured, the application default is "json"
        ,maxRowsReturned   : 3000 // the number of rows returned from database output. if or not set/configured, the application default is 2000
        ,zeroRowMessage    : 'No information found for North America Region' // the message returned when nothing is returned. if not set/configured, the application default is "0 rows returned"
        ,responseOutput    : ['host','network','connection','dbStatement','error','dbResponse','metaData','metrics'] // use any of the following choices, or use only one of the following special commands: "dataOnly", "verbose". if not set/configured, the application default is "dataOnly"
        ,timeZone          : 'local'// sets the time zone for timestamps returned in the response output information (this will NOT modify times/dates/timestamps within the dataset)
     };

     gopher.runModifiable(connectTo,transactionPlan,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
   ```
