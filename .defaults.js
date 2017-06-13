/*****************************************************************
  NAME: defaults
  PATH: ./defaults.js
  WHAT: sets application defaults
  WARNING!: This File is Subject to Change. Based on the location
            of this file, modifications to the defaults (below) may
            be lost upon module downloads (i.e. running "npm install")

******************************************************************/

//-----------------------------------------------------------------
//------------------------INSTANCE DEFAULTS------------------------
//-----------------------------------------------------------------
// these defaults can be overidden upon function calls to gopherdata

//-----------TIME ZONE DEFAULT-----------
// WHAT: Sets the time zone of any timestamp output returned from the gopherdata
// module
// NOTE: this setting DOES NOT MODIFY OR FORMAT any data returned from
// database transactions
// CHOICES: utc, local
const TIME_ZONE = 'utc'

const TIME_FORMAT = 'iso'

//-----------NO ROWS RETURNED MESSAGE DEFAUT-----------
// WHAT: sets the default message returned if no rows are returned
const ZERO_ROW_MESSAGE = '0 rows returned'

//-----------TIME OUT DEFAULT-----------
// WHAT: the default time out (in milliseconds): If the time out is exceeded, a
// time out error message is thrown
const TIME_OUT = 120 * 1000// default is set at 120,000 mS (or 2min)

//-----------TIME OUT MESSAGE DEFAULT-----------
// WHAT: the default message returned if the transaction time has exceeded the
// TIME_OUT default
const TIME_OUT_MESSAGE = 'Transaction timed out'

//-----------NUMBER OF ROWS RETURNED DEFAULT-----------
// WHAT: the default for the maximum number of rows permitted to be returned
// from a database transaction
const MAX_ROWS_RETURNED = 2000

//-----------RETURNED DATA FORMAT----------------------
// WHAT: the default format used for the databases data output.
// CHOICES: json, array, or object
const OUTPUT_FORMAT = 'json'

//-----------TRANSACTION RESPONSE DEFAULT-----------------
// WHAT: the default level of transaction metadata verbosity from your gopher...add
// what is needed to the array.
// CHOOSE ANY ONE OF THE FOLLOWING: 'dbResponse', 'metaData', 'dbStatement', 'metics', 'host', 'connection'
// OR CHOOSE ONE OF THE FOLLOWING: 'dataOnly','sqlOnly','verbose'
const RESPONSE_OUTPUT =['dataOnly']


//-----------------------------------------------------------------
//--------------------------gofig DEFAULTS-------------------------
//-----------------------------------------------------------------
// these defaults can be overidden by creating a file called:
// .gofig.json on the root of the Node application (where this modules
// is installed )

//----------GOPHER CHATTER DEFAULT-------------------
// the default Gopher Chatter options; that is, the  step-by-step messaging that
// eminates from this modules function activities
// CHOICES TO OUTPUT CHATTER TO: emitter, console
// OUTPUT CHOICES: errors, activities, responseOutput
const GOPHER_CHATTER_OUTPUT = {
  'emitter':['errors','activities','response'],
  'console':['errors']
}


//-----------------------------------------------------------------
//-------------------------MODULE DEFAULTS-------------------------
//-----------------------------------------------------------------
// these defaults can only be set here


//-----------CONSOLE PROMPT------------------
const PROMPT_TEXT = '<GOPHER}~'
const PROMPT_COLOR = 3  //CODES: 0=Black, 1=Red, 2=Green, 3=Yellow, 4=Blue, 5=Magenta, 6=Cyan, 7=White
const SECONDARY_PROMPT_COLOR = 6  //CODES: 0=Black, 1=Red, 2=Green, 3=Yellow, 4=Blue, 5=Magenta, 6=Cyan, 7=White

//-----------CONSOLE ERROR PROMPT--------------------
const ERROR_PROMPT_TEXT = 'ERROR:'
const ERROR_PROMPT_COLOR = 1 //CODES: 0=Black, 1=Red, 2=Green, 3=Yellow, 4=Blue, 5=Magenta, 6=Cyan, 7=White

const GOPHER_PROMPT = '\x1b[3'+PROMPT_COLOR+'m'+'\n'+PROMPT_TEXT+' \x1b[0m'
const GOPHER_ERROR_PROMPT = GOPHER_PROMPT+'\x1b[3'+ERROR_PROMPT_COLOR+'m'+ERROR_PROMPT_TEXT+' \x1b[0m'



exports.defaults = {
  "maxRowsReturned"   : MAX_ROWS_RETURNED,
  "outputFormat"      : OUTPUT_FORMAT,
  "zeroRowMessage"    : ZERO_ROW_MESSAGE,
  "timeOut"           : TIME_OUT,
  "timeOutMessage"    : TIME_OUT_MESSAGE,
  "responseOutput"    : RESPONSE_OUTPUT,
  "timeZone"          : TIME_ZONE,
  "timeFormat"        : TIME_FORMAT,
  "gopherChatter"     : GOPHER_CHATTER_OUTPUT,
  "promptText"        : PROMPT_TEXT,
  "secondPromptColor"  : SECONDARY_PROMPT_COLOR,
  "promptColor"       : PROMPT_COLOR,
  "errorPromptText"   : ERROR_PROMPT_TEXT,
  "errorPromptColor"  : ERROR_PROMPT_COLOR,
  "gopherPrompt"      : GOPHER_PROMPT,
  "gopherErrorPrompt" : GOPHER_ERROR_PROMPT}
