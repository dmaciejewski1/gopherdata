/*****************************************************************
  NAME: gopher-message.js
  PATH: /lib/gopher-message.js

  DEPENDENCIES:
    gopher-tools: set transaction configuration
    gopher-time: getISOUTCDt
    defaults:
******************************************************************/
"use strict"
const fs = require('fs')
const path = require('path')
const util = require('util')
const Events = require('events')
class EventEmitter extends Events {}
const eventEmitter = new EventEmitter()
const gofigLocation = '../../../.gofig.json'
const modDefaults = require('../defaults').defaults


class GopherMessage {

  constructor() {
    this.messageConfig = {
//      msg : this
    }
  //  this.
    //this.gopherTime = new require('./gopher-time')
    // this.emitter = new require('events').EventEmitter()
    //this.util = require('util')
  //  this.gophEmitter = (type, message) => {

  //  }
  }

  gofigFileExists () {
    try {
      fs.statSync(path.resolve(__dirname,gofigLocation)) }
    catch(e) {
      console.log(e);
      return false }
    return true
  }




  gopherChatter (type, message, time){
   this._gophSetMsgConfig ()

   //emitters....
//if error -> output error messages
  //build ouptput based on gopherChatter config...
      //if 'error' this.messageConfig.gopherChatter.

//if process -> output module process messages
  //build ouptput based on gopherChatter config

//if status -> output database transaction status messages
  //build ouptput based on gopherChatter config

//if report -> output report messages
  //build ouptput based on gopherChatter config

  //console...
  for (let conConfig = 0;conConfig<this.messageConfig.gopherChatter.console.length; conConfig++){
    if (type === 'ERROR'||
        type === 'ERROR!'||
        type === 'err'||
        type === 'err!'||
        type === 'error'||
        type === 'error!'||
        type === 'gophErr'||
        type === 'gophErr!') {
      if (this.messageConfig.gopherChatter.console[conConfig] === "errors" &&
          message){
        this._gophConsoleLog ('error', message, time) }}
    if (this.messageConfig.gopherChatter.console[conConfig] === "activities" &&
        type ==="activity" &&
        message){
      this._gophConsoleLog ('activity', message, time) }
    if (this.messageConfig.gopherChatter.console[conConfig] === "database" &&
        type ==="database" &&
        message){
      this._gophConsoleLog ('database', message, time) }
    if (this.messageConfig.gopherChatter.console[conConfig] === "start/end" &&
        type ==="start/end" &&
        message){
      this._gophConsoleLog ('start/end', message, time) }
    if (this.messageConfig.gopherChatter.console[conConfig] === "response" &&
        type ==="response" &&
        message){
      this._gophConsoleLog ('response', message, time) }
    if (this.messageConfig.gopherChatter.console[conConfig] === "debug" &&
        type ==="debug" &&
        message){
      this._gophConsoleLog ('debug', message, time) } }

    for (let conConfig = 0;conConfig<this.messageConfig.gopherChatter.console.length; conConfig++){
      if (type === 'ERROR'||
          type === 'ERROR!'||
          type === 'err'||
          type === 'err!'||
          type === 'error'||
          type === 'error!'||
          type === 'gophErr'||
          type === 'gophErr!') {
        if (this.messageConfig.gopherChatter.console[conConfig] === "errors" &&
            message){
              //console.log(message);
          this._gophEmit ('error', message) }}
      if (this.messageConfig.gopherChatter.console[conConfig] === "activities" &&
          type ==="activity" &&
          message){
        this._gophEmit ('activity', message) }
      if (this.messageConfig.gopherChatter.console[conConfig] === "status" &&
          type ==="status" &&
          message){
        this._gophEmit ('status', message) }
      if (this.messageConfig.gopherChatter.console[conConfig] === "reports" &&
          type ==="reports" &&
          message){
        this._gophEmit ('report', message) }
      if (this.messageConfig.gopherChatter.console[conConfig] === "messages" &&
          type ==="messages" &&
          message){
        this._gophEmit ('message', message) } }
}


// _gophEmitterResponse (message) {
//   let GopherTime = require('./gopher-time'),
//       gopherTime = new GopherTime()
// }
//

_gophEmit (type, message){
//  this.on ('error')
 //this.emit('error',{'message':message})
 //this.on('error',() => {})
 // this.on('process',() => {})
 // this.on('status',() => {})
 // this.on('report',() => {})
 // this.on('message',() => {
   //console.log(message)
if (type === 'error') {
}

}


_gophConsoleLog (type, message, time) {
  let GopherTime = require('./gopher-time'),
      gopherTime = new GopherTime().getTimestamp(this.messageConfig.timeZone,this.messageConfig.timeFormat),
      secondaryPrompt = (PROMPT_TEXT)=>{
        if (type === 'error'){

          return '\x1b[3'+this.messageConfig.errorPromptColor+'m'+PROMPT_TEXT+': ['+gopherTime+'] '+'\x1b[0m'
        }else{
          return '\x1b[3'+this.messageConfig.secondPromptColor+'m'+PROMPT_TEXT+': ['+gopherTime+'] '+'\x1b[0m'
        }}
  if (type === 'error'){
            console.log(message);
    if (message.constructor === Object) {
      console.log(this.messageConfig.gopherPrompt+secondaryPrompt('ERROR')+''+message.error.message)
      return  }
    //else if ()
    else {
      console.log(this.messageConfig.gopherPrompt+secondaryPrompt('ERROR')+''+message)
      return  }
  }
  else if (type === 'response'){
    console.log(this.messageConfig.gopherPrompt+secondaryPrompt('RESPONSE'))
    console.log(message)
    console.log('')
    return
  }
  else if (type === 'database'){
    console.log(this.messageConfig.gopherPrompt+secondaryPrompt('DATABASE')+ message)
    return
  }
  else if (type === 'start/end'){
    console.log(this.messageConfig.gopherPrompt+secondaryPrompt('START/END')+ message)
    return
  }
  else if (type === 'activity'){
    console.log(this.messageConfig.gopherPrompt+secondaryPrompt('ACTIVITY')+ message)
    return
  }
  else if (type === 'debug'){
    console.log(this.messageConfig.gopherPrompt+secondaryPrompt('DEBUG')+ message)
   return
  }
  else {
    console.log(this.messageConfig.gopherPrompt+message+'\n')
    return }
}




  _gophSetMsgConfig () {
    let appDefaults = require(gofigLocation)
    if (this.gofigFileExists()) {
      if (appDefaults.timeZone) {
        Object.assign(
          this.messageConfig,
          { "timeZone" : appDefaults.timeZone} ) }
      else {
        Object.assign(
          this.messageConfig,
          { "timeZone" : modDefaults.timeZone} ) }

      if (appDefaults.timeFormat) {
        Object.assign(
          this.messageConfig,
          { "timeFormat" : appDefaults.timeFormat} ) }
      else {
        Object.assign(
          this.messageConfig,
          { "timeFormat" : modDefaults.timeFormat} ) }
      if (appDefaults.gopherChatter) {
        Object.assign(
          this.messageConfig,
          { "gopherChatter" : {}} )
        if (appDefaults.gopherChatter.emitter) {
          Object.assign(
            this.messageConfig.gopherChatter,
            { "emitter" : appDefaults.gopherChatter.emitter} ) }
        else {
          Object.assign(
            this.messageConfig.gopherChatter,
            { "emitter" : modDefaults.gopherChatter.emitter} ) }
        if (appDefaults.gopherChatter.console) {
          Object.assign(
            this.messageConfig.gopherChatter,
            { "console" : appDefaults.gopherChatter.console} ) }
        else {
          Object.assign(
            this.messageConfig.gopherChatter,
            { "console" : modDefaults.gopherChatter.console} ) } }
      else {
        Object.assign(
          this.messageConfig,
          { "gopherChatter" : modDefaults.gopherChatter} ) }
      Object.assign(
        this.messageConfig,
        {
          "gopherPrompt" : modDefaults.gopherPrompt,
          "secondPromptColor" : modDefaults.secondPromptColor,
          "gopherErrorPrompt" : modDefaults.gopherErrorPrompt,
          "errorPromptColor" : modDefaults.errorPromptColor } ) }
    else {
      Object.assign(
        this.messageConfig,
        { "timeZone" : modDefaults.timeZone,
          "timeFormat" : modDefaults.timeFormat,
          "gopherChatter" : modDefaults.gopherChatter,
          "gopherPrompt" : modDefaults.gopherPrompt,
          "gopherErrorPrompt" : modDefaults.gopherErrorPrompt } ) }
  }







  // _gophMsgHandler (type, message) {
  //   if (
  //     (type === 'ERROR' &&  message) ||
  //     (type === 'ERROR!' &&  message )||
  //     (type === 'err' &&  message )||
  //     (type === 'err!' &&  message )||
  //     (type === 'error' &&  message )||
  //     (type === 'error!' &&  message )||
  //     (type === 'gophErr' &&  message )||
  //     (type === 'gophErr!' &&  message ))
  //   {
  //     if (message.constructor === Object) {
  //       console.log(this.defaults.gopherErrorPrompt+'\n')
  //       console.log(message) }
  //     else {
  //       console.log(this.defaults.gopherErrorPrompt+message+'\n') } }
  //
  //   else if (message) {
  //     console.log(this.defaults.gopherPrompt+message+'\n')
  //   }
  // }

  gophConsoleLog (type, msg) {
    this._gophSetMsgConfig()
    let GopherTime = require('./gopher-time'),
        ts = new GopherTime().getTimestamp(this.messageConfig.timeZone,this.messageConfig.timeFormat)
    if (
      (type === 'ERROR' &&  msg) ||
      (type === 'ERROR!' &&  msg )||
      (type === 'err' &&  msg )||
      (type === 'err!' &&  msg )||
      (type === 'error' &&  msg )||
      (type === 'error!' &&  msg )||
      (type === 'gophErr' &&  msg )||
      (type === 'gophErr!' &&  msg )
    )
    {
      if (msg.constructor === Object) {
        //console.log(appDefaults.gopherChatter.emitter);
        console.log(this.messageConfig.gopherErrorPrompt+' '+msg.error.message+'\n')
        return  }
      else {
        console.log(this.messageConfig.gopherErrorPrompt+msg+'\n')
        return  } }

    else if (msg) {
      console.log(this.messageConfig.gopherPrompt+msg+'\n')
      return }
  }



  //---------THE DREAM---------

  //--EXAMPLE CALL for "THE DREAM"...
  // gophOutput( {
  //   type      : 'gophErr',
  //   message   : 'This is an ERROR!!!' } )

  //--"DREAM" DEVELOPMENT...

  // gophOutputMessage (msgType,outputType, msg) {
  //   if (outputType)
  //
  //   if (
  //     (msgType === 'ERROR' &&  msg) ||
  //     (msgType === 'ERROR!' &&  msg )||
  //     (msgType === 'err' &&  msg )||
  //     (msgType === 'err!' &&  msg )||
  //     (msgType === 'error' &&  msg )||
  //     (msgType === 'error!' &&  msg )||
  //     (msgType === 'gophErr' &&  msg )||
  //     (msgType === 'gophErr!' &&  msg ))
  //   {
  //     if (msg.constructor === Object) {
  //       console.log(this.defaults.gopherErrorPrompt+'\n')
  //       console.log(msg) }
  //     else {
  //       console.log(this.defaults.gopherErrorPrompt+msg+'\n') } }
  //
  //   else if (msg) {
  //     console.log(this.defaults.gopherPrompt+msg+'\n')
  //   }
  // }


}
//util.inherits(GopherMessage, EventEmitter)
module.exports = GopherMessage
