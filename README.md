# gopher
Develop, Organize and Execute database statements from within a Node.js environment against an Oracle Database

## Summary
Maintain and execute canned or dynamic DDL/DML statements that are stored within library files (in json format)
executed from a Node.js configured environment against an Oracle backend. Gopher helps keep track of Database
Connection and Transaction/SQL configurations while giving you handy data output options, and valuable feedback
about the process.

## Usage
Build and Configure Gophers to:
* access and retrieve information from your locally stored Connection and Transaction libraries
* facilitate connections with databases
* send and retrieve database transactions
* configure and serve data and metadata output
* abstract away details about database connections and transactions
* integrate with web-API development and/or with other Node.js modules (such as Express.js)

## Requirements
* Node.js (works with v0.10.28 through v6.2.2)
* Oracle Instant Client (works with v11.2 through v12.1)

## Contents
|Jump to a section...|
|:-----------|
|[Oracle Instant Client Setup](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#oracle-instant-client-setup)|
|[Setup and Configure](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#setup-and-configure)|
|[Build a Gopher](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#build-a-gopher)|
|[Create a Gopher Schema](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#create-a-gopher-schema)|
|[Create Gopher Calls](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#create-some-gopher-calls)|


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
 This will set up a basic (non-functional) model for operation called "gopher-demo" (Use to create gopher development patterns)
### A. Setup and Configure
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
   3. From the gopher-demo main directory, create directories named "libraries/connection" from the main gopher-demo directory:

   ```bash
mkdir -p libraries/connection
   ```
   4. From the gopher-demo main directory, create a directory in "libraries" named "libraries/transaction":

   ```bash
mkdir libraries/transaction
   ```
   5. From the gopher-demo main directory, create a connection library (file) named finance-connections.json:

   ```bash
touch libraries/connection/finance-connections.json
   ```
   6. From the gopher-demo main directory, create a transaction library (file) named oracle-dictionary-transactions.json:

   ```bash
touch libraries/transaction/oracle-dictionary-transactions.json
   ```
   7. **CONFIGURE A CONNECTION LIBRARY** : Add the following code to libraries/connection/finance-connections.json and save:

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
   8. **CONFIGURE A TRANSACTION LIBRARY**: Here, "get-Tables" and "get-Columns" are canned Transactions with configurable default properties. A gopher can easily be instructed/configured to execute a specific Transaction against a specific Connection. Add the following code to libraries/transaction/oracle-dictionary-transactions.json and save:

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
   9. **ASSOCIATE TRANSACTION LIBRARIES TO SPECIFIC CONNECTIONS**: Here, Transaction Libraries are linked to specific Connections so, where necessary, commonly used transactions can be shared across multiple database environments. In this example the "transactionLibraries" Property has been set from within the libraries/connection/finance-connections.json file. *(this non-functional demo uses only some of the example configuration above)*:

   ```json
[
  {"finance-Prod" :{
        "user"                 : "me",
        "password"             : "myProdPassword",
        "host"                 : "databases.arecool.com",
        "port"                 : 12345,
        "service"              : "databases.arecool.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary-transactions.json",
                                  "./libraries/transaction/finance-production-transactions.json"]
  }},
  {"finance-Dev" :{
        "user"                 : "me",
        "password"             : "myDevPassword",
        "host"                 : "financedatabases.arecooltoo.com",
        "port"                 : 12345,
        "SID"                  : "financedatabases.arecooltoo.com",
        "transactionLibraries" : ["./libraries/transaction/oracle-dictionary-transactions.json",
                                  "./libraries/transaction/finance-development-transactions.json",
                                  "./libraries/transaction/myfinanceSandbox-transactions.json"]
  }}
]
   ```

### B. Build a Gopher
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---
Create a simple Gopher that uses a stored transaction named "get-Tables" (found in the oracle-dictionary-transactions.json transaction library) to get a list of all tables names from the Finance Production Database (whose connection info can be found in the finance-connections.json connection library as "finance-Prod") *(this non-functional demo uses only some of the example configuration above)*.

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
     let transactionObject = {transaction : transactionName};

     new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
       .run(transactionObject,
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

   runGopher('finance-Prod','get-Tables',
     function(gophErr, gophRes){
       if(gophErr){console.log(gophRes);}
     console.log(gophRes)
     }
   );
 ```

### C. Build a simple abstraction
#### I. Create a Gopher schema
#####[[back to top](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md)] [[back to contents](https://github.com/dmaciejewski1/gopherdata/blob/master/README.md#contents)]
---
 Create a gopher-schema.js file and load it up with links to your connection libraries, and then build/configure your transaction types
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
      let transactionObject = {transaction : transactionName};

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionObject,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //----------------------With Bind Variables---------------------

    exports.runWBindVariables = function(dbConnection,transactionName,bindVariables,callback){

      let transactionObject = {
        transaction        : transactionName,
        bindVariables      : bindVariables
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionObject,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //---------------------------Show SQL---------------------------

    exports.showSql = function(dbConnection,transactionName,callback){

      let transactionObject = {
        transaction        : transactionName,
        responseOutput     : ['sqlOnly']
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionObject,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //---------------------------Verbose----------------------------

    exports.runVerbose = function(dbConnection,transactionName,callback){

      let transactionObject = {
        transaction        : transactionName,
        responseOutput     : ['verbose']
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionObject,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //------------------------Get Db Tables-------------------------

    exports.getTables = function(dbConnection,callback){

      let transactionObject = {transaction  : 'get-Tables'};

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionObject,
          function(err,res){
            if (err) {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //------------------------Get Db Columns------------------------

    exports.getColumns = function(dbConnection,table,callback){

      let transactionObject = {
        transaction    : 'get-Columns',
        bindVariables  : {tableName:table}
      };

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionObject,
          function(err,res){
            if (err)  {return callback(err,res);}
            return callback(err,res);
          }
        );
    }

   //--------------------------Modifiable--------------------------

    exports.runModifiable = function(dbConnection,transactionObject,callback){

      new Gopher({"connection":dbConnection,"connectionLibraries":GARDENS})
        .run(transactionObject,
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
 3. **Basic Run** : append the "run" Gopher to myGopherCalls.js to execute a stored Transaction against a stored Database connection (provided the named Transaction is configured to work with the named Connection...SEE the Connection Library. Note: Make sure the "transactionLibraries" property is set/formatted properly)
 ```js

     connection = 'myDatabase-Prod';
     transaction = 'get-Tables';

     gopher.run(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 4. **With Bind Variables** : append the "runWBindVariables" Gopher to myGopherCalls.js to allow bind variables to be used with transactions and returns just the data
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
 5. **View SQL Statement** : append the "showSql" Gopher to myGopherCalls.js to return just the SQL Statement sent to generate the quarterly report (without the data)
 ```js

     connection = 'finance-Prod';
     transaction = 'get-quarterly-report';

     gopher.showSql(connection,transaction,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 6. **Show List of Database Table Names** : append the "getTables" Gopher to myGopherCalls.js to return just the Database tables of a given connection
 ```js

     connection = 'myDatabase-Prod';

     gopher.getTables(connection,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 7. **Show List of Table Column Names** : append the "getColumns" Gopher to myGopherCalls.js to return  given connection
 ```js

     connection = 'myDatabase-Prod';
     var table = 'quarterly_report';

     gopher.getColumns(connection,table,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
 ```
 8. **Run Transaction as Modifiable** : append the "runModifiable" Gopher to myGopherCalls.js to override a Transaction's defaults
 ```js

     connection = 'myDatabase-Prod';
     transactionPlan = {
         transaction       :'quarterly-report'
        ,bindVariables     :{ region     : 'North America',
                              division   : 'Sales',
                              storeID    : '1234'}
        ,outputFormat      : 'object'
        ,maxRowsReturned   : 3000
        ,zeroRowMessage    : 'This quarterly report was not found.'
        ,responseOutput    : ['host','network','connection','dbStatement','error','dbResponse','metaData','metrics']
        ,timeZone          : 'local'
     };

     gopher.runModifiable(connectTo,transactionPlan,
       function(gophErr, gophRes){
         if(gophErr){console.log(gophRes);}
         console.log(gophRes)
       }
     );
   ```
