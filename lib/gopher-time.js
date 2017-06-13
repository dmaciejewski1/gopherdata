/*****************************************************************
  NAME: gopher-time.js
  PATH: /lib/gopher-time.js
  WHAT: outputs a timestamp object with a variety of time outputs
        in both local and UTC time.
******************************************************************/
"use strict";

/******************************************************************
                       THE NEW WAY.... (v0.2.0 release)
******************************************************************/
const GopherMessage = new require('./gopher-message')
class GopherTime extends GopherMessage {
  constructor () {
    super()
    this.today = new Date(),
    this.utcID = this.today.getTime(),
    this.day = this.today.getDay(),
    this.month = this.today.getMonth(),
    this.date = this.today.getDate(),
    this.year = this.today.getFullYear(),
    this.hour = this.today.getHours(),
    this.min = this.today.getMinutes(),
    this.sec = this.today.getSeconds(),
    this.msec = this.today.getMilliseconds(),
    this.dayUTC = this.today.getUTCDay(),
    this.monthUTC = this.today.getUTCMonth(),
    this.dateUTC = this.today.getUTCDate(),
    this.yearUTC = this.today.getUTCFullYear(),
    this.hourUTC = this.today.getUTCHours(),
    this.minUTC = this.today.getUTCMinutes(),
    this.secUTC = this.today.getUTCSeconds(),
    this.msecUTC = this.today.getUTCMilliseconds(),
    this.tz = this.today.getTimezoneOffset(),
    this.tzUTC = "+00:00";
  }

  _getDayOfWeek3letter (day){
    if(day === 0) {return "Sun"}
    if(day === 1) {return "Mon"}
    if(day === 2) {return "Tue"}
    if(day === 3) {return "Wed"}
    if(day === 4) {return "Thu"}
    if(day === 5) {return "Fri"}
    if(day === 6) {return "Sat"}
  }

  _isWeekday (day){
    if(day === 0 || day === 6) {return "no"}
    if(day === 1 ||day === 2 ||day === 3 ||day === 4 ||day === 5) {return "yes"}
  }

  _getMonth3Letter (month){
    if(month === 0) {return "Jan"}
    if(month === 1) {return "Feb"}
    if(month === 2) {return "Mar"}
    if(month === 3) {return "Apr"}
    if(month === 4) {return "May"}
    if(month === 5) {return "Jun"}
    if(month === 6) {return "Jul"}
    if(month === 7) {return "Aug"}
    if(month === 8) {return "Sep"}
    if(month === 9) {return "Oct"}
    if(month === 10) {return "Nov"}
    if(month === 11) {return "Dec"}
  }

  _getTz (timeZoneOffsetMinutes){
    if(timeZoneOffsetMinutes === 720) {return "-12:00"}
    if(timeZoneOffsetMinutes === 660) {return "-11:00"}
    if(timeZoneOffsetMinutes === 600) {return "-10:00"}
    if(timeZoneOffsetMinutes === 540) {return "-09:00"}
    if(timeZoneOffsetMinutes === 480) {return "-08:00"}
    if(timeZoneOffsetMinutes === 420) {return "-07:00"}
    if(timeZoneOffsetMinutes === 360) {return "-06:00"}
    if(timeZoneOffsetMinutes === 300) {return "-05:00"}
    if(timeZoneOffsetMinutes === 240) {return "-04:00"}
    if(timeZoneOffsetMinutes === 180) {return "-03:00"}
    if(timeZoneOffsetMinutes === 120) {return "-02:00"}
    if(timeZoneOffsetMinutes === 60) {return "-01:00"}
    if(timeZoneOffsetMinutes === 0) {return "+00:00"}
    if(timeZoneOffsetMinutes === -60) {return "+01:00"}
    if(timeZoneOffsetMinutes === -120) {return "+02:00"}
    if(timeZoneOffsetMinutes === -180) {return "+03:00"}
    if(timeZoneOffsetMinutes === -240) {return "+04:00"}
    if(timeZoneOffsetMinutes === -300) {return "+05:00"}
    if(timeZoneOffsetMinutes === -360) {return "+06:00"}
    if(timeZoneOffsetMinutes === -420) {return "+07:00"}
    if(timeZoneOffsetMinutes === -480) {return "+08:00"}
    if(timeZoneOffsetMinutes === -540) {return "+09:00"}
    if(timeZoneOffsetMinutes === -600) {return "+10:00"}
    if(timeZoneOffsetMinutes === -660) {return "+11:00"}
    if(timeZoneOffsetMinutes === -720) {return "+12:00"}
  }

  _getAmPm (hour24){
    if(hour24 < 12) {
      return "AM"
    }else {
      return "PM"}
  }

  _get12Hour (hour24){
    if(hour24 === 0) {return "12"}
    if(hour24 === 1) {return "01"}
    if(hour24 === 2) {return "02"}
    if(hour24 === 3) {return "03"}
    if(hour24 === 4) {return "04"}
    if(hour24 === 5) {return "05"}
    if(hour24 === 6) {return "06"}
    if(hour24 === 7) {return "07"}
    if(hour24 === 8) {return "08"}
    if(hour24 === 9) {return "09"}
    if(hour24 === 10) {return "10"}
    if(hour24 === 11) {return "11"}
    if(hour24 === 12) {return "12"}
    if(hour24 === 13) {return "01"}
    if(hour24 === 14) {return "02"}
    if(hour24 === 15) {return "03"}
    if(hour24 === 16) {return "04"}
    if(hour24 === 17) {return "05"}
    if(hour24 === 18) {return "06"}
    if(hour24 === 19) {return "07"}
    if(hour24 === 20) {return "08"}
    if(hour24 === 21) {return "09"}
    if(hour24 === 22) {return "10"}
    if(hour24 === 23) {return "11"}
  }

  _left2DigitPad(number){
    if (number < 10) {
      return '0'+number;
    }else{return number;}
  }

  _right3DigitPad(number){
    if (number.toString().length === 2) {
      return number+'0';
    }else if (number.toString().length === 1){
      return number+'00';
    }else if (number.toString().length === 0){
      return number+'000';
    }else{return number;}
  }

  _getLocalDt() {
    return this._getDayOfWeek3letter(this.day)+' '+this._getMonth3Letter(this.month)+' '+this._left2DigitPad(this.date)+' '+this.year+' '+this._left2DigitPad(this.hour)+':'+this._left2DigitPad(this.min)+':'+this._left2DigitPad(this.sec)+'.'+this.msec+' GMT'+this._getTz(this.tz)
      // this._getDayOfWeek3letter(this.day)+' '+this._getMonth3Letter(this.month)+' '+this._left2DigitPad(this.date)+' '+this.year+' '+this._left2DigitPad(this.hour)+':'+this._left2DigitPad(this.min)+':'+this._left2DigitPad(this.sec)+'.'+this.msec+' GMT'+this._getTz(this.tz)
  }

  _getUtcDt() {
    return this._getDayOfWeek3letter(this.dayUTC)+' '+this._getMonth3Letter(this.monthUTC)+' '+this._left2DigitPad(this.dateUTC)+' '+this.yearUTC+' '+this._left2DigitPad(this.hourUTC)+':'+this._left2DigitPad(this.minUTC)+':'+this._left2DigitPad(this.secUTC)+'.'+this.msecUTC+' GMT'+this.tzUTC
    //return this.year+"-"+this._left2DigitPad(this.month+1)+"-"+this._left2DigitPad(this.date)+"T"+this._left2DigitPad(this.hour)+":"+this._left2DigitPad(this.min)+":"+this._left2DigitPad(this.sec)+"."+this._right3DigitPad(this.msec)+this._getTz(this.tz)
  }

  _getIsoLocalDt() {
    return this.year+"-"+this._left2DigitPad(this.month+1)+"-"+this._left2DigitPad(this.date)+"T"+this._left2DigitPad(this.hour)+":"+this._left2DigitPad(this.min)+":"+this._left2DigitPad(this.sec)+"."+this._right3DigitPad(this.msec)+this._getTz(this.tz)
    //return this._getDayOfWeek3letter(this.dayUTC)+' '+this._getMonth3Letter(this.monthUTC)+' '+this._left2DigitPad(this.dateUTC)+' '+this.yearUTC+' '+this._left2DigitPad(this.hourUTC)+':'+this._left2DigitPad(this.minUTC)+':'+this._left2DigitPad(this.secUTC)+'.'+this.msecUTC+' GMT'+this.tzUTC
  }

  _getIsoUtcDt () {
    return this.yearUTC+"-"+this._left2DigitPad(this.monthUTC+1)+"-"+this._left2DigitPad(this.dateUTC)+"T"+this._left2DigitPad(this.hourUTC)+":"+this._left2DigitPad(this.minUTC)+":"+this._left2DigitPad(this.sec)+"."+this._right3DigitPad(this.msecUTC)+'Z'
  }

  getTimestamp (zone, type) {
    if (zone === 'local' && type === 'iso') {
      return this._getIsoLocalDt() }
    if (zone === 'local' && type === 'pretty') {
      return this._getLocalDt() }
    if (zone === 'utc' && type === 'iso') {
      return this._getIsoUtcDt() }
    if (zone === 'utc' && type === 'pretty') {
      return this._getUtcDt() }
  }

  getDateObject () {
    return  {
      "localTime" : {
          "utcID":this.utcID,
          "day":this._getDayOfWeek3letter(this.day),
          "month":this._getMonth3Letter(this.month),
          "monthNumber":this.today.getMonth()+1,
          "date":this._left2DigitPad(this.date),
          "year":this.year,
          "hour24":this._left2DigitPad(this.hour),
          "hour12":this._get12Hour(this.hour),
          "minute":this._left2DigitPad(this.min),
          "second":this._left2DigitPad(this.sec),
          "millisecond":this.msec,
          "AmPm":this._getAmPm(this.hour),
          "timezone":this._getTz(this.tz),
          "minutesOffsetFromUTC":this.today.getTimezoneOffset(),
          "datetime":this._getLocalDt(),
          "timestamp":this._getIsoLocalDt() },
      "utcTime" : {
          "utcID":this.utcID,
          "day":this._getDayOfWeek3letter(this.dayUTC),
          "month":this._getMonth3Letter(this.monthUTC),
          "monthNumber":this.today.getMonth()+1,
          "date":this._left2DigitPad(this.dateUTC),
          "year":this.yearUTC,
          "hour24":this._left2DigitPad(this.hourUTC),
          "hour12":this._get12Hour(this.hourUTC),
          "minute":this._left2DigitPad(this.minUTC),
          "second":this._left2DigitPad(this.secUTC),
          "millisecond":this.msecUTC,
          "AmPm":this._getAmPm(this.hourUTC),
          "timezone":this.tzUTC,
          "minutesOffsetFromUTC":0,
          "datetime":this._getUtcDt(),
          "timestamp":this._getIsoUtcDt() } }
  }

}

/******************************************************************
                       THE OLD WAY
                       to be decommissioned...
******************************************************************/
/*****************************************************************
  NAME: gopher-time.js
  PATH: /lib/gopher-time.js
  WHAT: outputs a timestamp object with a variety of time outputs
        in both local and UTC time.
******************************************************************/
// "use strict";
// exports.getDateObject = function() {
//   var today = new Date(),
//       utcID = today.getTime(),
//       day = today.getDay(),//need asn
//       month = today.getMonth(),
//       date = today.getDate(),//need asn
//       year = today.getFullYear(),
//       hour = today.getHours(),//need asn (for UTC only)
//       min = today.getMinutes(),//need asn
//       sec = today.getSeconds(),//need asn
//       msec = today.getMilliseconds(),
//       dayUTC = today.getUTCDay(),
//       monthUTC = today.getUTCMonth(),
//       dateUTC = today.getUTCDate(),
//       yearUTC = today.getUTCFullYear(),
//       hourUTC = today.getUTCHours(),
//       minUTC = today.getUTCMinutes(),
//       secUTC = today.getUTCSeconds(),
//       msecUTC = today.getUTCMilliseconds(),
//       tz = today.getTimezoneOffset(),
//       tzUTC = "+00:00";
//
//   function getDayOfWeek3letter(day){
//     if(day === 0) {return "Sun";}
//     if(day === 1) {return "Mon";}
//     if(day === 2) {return "Tue";}
//     if(day === 3) {return "Wed";}
//     if(day === 4) {return "Thu";}
//     if(day === 5) {return "Fri";}
//     if(day === 6) {return "Sat";}
//   }
//
//   function isWeekday(day){
//     if(day === 0 || day === 6) {return "no";}
//     if(day === 1 ||day === 2 ||day === 3 ||day === 4 ||day === 5) {return "yes";}
//   }
//
//   function isWeekend(day){
//     if(day === 0 || day === 6) {return "yes";}
//     if(day === 1 ||day === 2 ||day === 3 ||day === 4 ||day === 5) {return "no";}
//   }
//
//   function getMonth3Letter(month){
//     if(month === 0) {return "Jan";}
//     if(month === 1) {return "Feb";}
//     if(month === 2) {return "Mar";}
//     if(month === 3) {return "Apr";}
//     if(month === 4) {return "May";}
//     if(month === 5) {return "Jun";}
//     if(month === 6) {return "Jul";}
//     if(month === 7) {return "Aug";}
//     if(month === 8) {return "Sep";}
//     if(month === 9) {return "Oct";}
//     if(month === 10) {return "Nov";}
//     if(month === 11) {return "Dec";}
//   }
//
//   function getTz (timeZoneOffsetMinutes){
//     if(timeZoneOffsetMinutes === 720) {return "-12:00";}
//     if(timeZoneOffsetMinutes === 660) {return "-11:00";}
//     if(timeZoneOffsetMinutes === 600) {return "-10:00";}
//     if(timeZoneOffsetMinutes === 540) {return "-09:00";}
//     if(timeZoneOffsetMinutes === 480) {return "-08:00";}
//     if(timeZoneOffsetMinutes === 420) {return "-07:00";}
//     if(timeZoneOffsetMinutes === 360) {return "-06:00";}
//     if(timeZoneOffsetMinutes === 300) {return "-05:00";}
//     if(timeZoneOffsetMinutes === 240) {return "-04:00";}
//     if(timeZoneOffsetMinutes === 180) {return "-03:00";}
//     if(timeZoneOffsetMinutes === 120) {return "-02:00";}
//     if(timeZoneOffsetMinutes === 60) {return "-01:00";}
//     if(timeZoneOffsetMinutes === 0) {return "+00:00";}
//     if(timeZoneOffsetMinutes === -60) {return "+01:00";}
//     if(timeZoneOffsetMinutes === -120) {return "+02:00";}
//     if(timeZoneOffsetMinutes === -180) {return "+03:00";}
//     if(timeZoneOffsetMinutes === -240) {return "+04:00";}
//     if(timeZoneOffsetMinutes === -300) {return "+05:00";}
//     if(timeZoneOffsetMinutes === -360) {return "+06:00";}
//     if(timeZoneOffsetMinutes === -420) {return "+07:00";}
//     if(timeZoneOffsetMinutes === -480) {return "+08:00";}
//     if(timeZoneOffsetMinutes === -540) {return "+09:00";}
//     if(timeZoneOffsetMinutes === -600) {return "+10:00";}
//     if(timeZoneOffsetMinutes === -660) {return "+11:00";}
//     if(timeZoneOffsetMinutes === -720) {return "+12:00";}
//   }
//
//   function getAmPm (hour24){
//     if(hour24 < 12) {
//       return "AM";
//     }else {
//       return "PM";}
//   }
//
//   function get12Hour (hour24){
//     if(hour24 === 0) {return "12";}
//     if(hour24 === 1) {return "01";}
//     if(hour24 === 2) {return "02";}
//     if(hour24 === 3) {return "03";}
//     if(hour24 === 4) {return "04";}
//     if(hour24 === 5) {return "05";}
//     if(hour24 === 6) {return "06";}
//     if(hour24 === 7) {return "07";}
//     if(hour24 === 8) {return "08";}
//     if(hour24 === 9) {return "09";}
//     if(hour24 === 10) {return "10";}
//     if(hour24 === 11) {return "11";}
//     if(hour24 === 12) {return "12";}
//     if(hour24 === 13) {return "01";}
//     if(hour24 === 14) {return "02";}
//     if(hour24 === 15) {return "03";}
//     if(hour24 === 16) {return "04";}
//     if(hour24 === 17) {return "05";}
//     if(hour24 === 18) {return "06";}
//     if(hour24 === 19) {return "07";}
//     if(hour24 === 20) {return "08";}
//     if(hour24 === 21) {return "09";}
//     if(hour24 === 22) {return "10";}
//     if(hour24 === 23) {return "11";}
//   }
//
//   function left2DigitPad(number){
//     if (number < 10) {
//       return '0'+number;
//     }else{return number;}
//   }
//
//   function right3DigitPad(number){
//     if (number.toString().length === 2) {
//       return number+'0';
//     }else if (number.toString().length === 1){
//       return number+'00';
//     }else if (number.toString().length === 0){
//       return number+'000';
//     }else{return number;}
//   }
//
//   var localDate = getDayOfWeek3letter(day)+' '+getMonth3Letter(month)+' '+left2DigitPad(date)+' '+year+' '+left2DigitPad(hour)+':'+left2DigitPad(min)+':'+left2DigitPad(sec)+'.'+msec+' GMT'+getTz(tz);
//   var utcDate = getDayOfWeek3letter(dayUTC)+' '+getMonth3Letter(monthUTC)+' '+left2DigitPad(dateUTC)+' '+yearUTC+' '+left2DigitPad(hourUTC)+':'+left2DigitPad(minUTC)+':'+left2DigitPad(secUTC)+'.'+msecUTC+' GMT'+tzUTC;
//   var isoLocaldate =  year+"-"+left2DigitPad(today.getMonth()+1)+"-"+left2DigitPad(date)+"T"+left2DigitPad(hour)+":"+left2DigitPad(min)+":"+left2DigitPad(sec)+"."+right3DigitPad(msec)+getTz(tz);
//   var isoUTCdate = yearUTC+"-"+left2DigitPad(today.getUTCMonth()+1)+"-"+left2DigitPad(dateUTC)+"T"+left2DigitPad(hourUTC)+":"+left2DigitPad(minUTC)+":"+left2DigitPad(sec)+"."+right3DigitPad(msecUTC)+'Z';
// return  {
//     "localTime" : {
//       "utcID":utcID,
//       "day":getDayOfWeek3letter(day),
//       "month":getMonth3Letter(month),
//       "monthNumber":today.getMonth()+1,
//       "date":left2DigitPad(date),
//       "year":year,
//       "hour24":left2DigitPad(hour),
//       "hour12":get12Hour(hour),
//       "minute":left2DigitPad(min),
//       "second":left2DigitPad(sec),
//       "millisecond":msec,
//       "AmPm":getAmPm(hour),
//       "timezone":getTz(tz),
//       "minutesOffsetFromUTC":today.getTimezoneOffset(),
//       "datetime":localDate,
//       "timestamp":isoLocaldate
//     },
//     "utcTime" : {
//       "utcID":utcID,
//       "day":getDayOfWeek3letter(dayUTC),
//       "month":getMonth3Letter(monthUTC),
//       "monthNumber":today.getMonth()+1,
//       "date":left2DigitPad(dateUTC),
//       "year":yearUTC,
//       "hour24":left2DigitPad(hourUTC),
//       "hour12":get12Hour(hourUTC),
//       "minute":left2DigitPad(minUTC),
//       "second":left2DigitPad(secUTC),
//       "millisecond":msecUTC,
//       "AmPm":getAmPm(hourUTC),
//       "timezone":tzUTC,
//       "minutesOffsetFromUTC":0,
//       "datetime":utcDate,
//       "timestamp":isoUTCdate
//     }
//   };
// }

module.exports = //{
  GopherTime //: GopherTime,
  //getDateObject : getDateObject

//}
