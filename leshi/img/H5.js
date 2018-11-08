// 当前是否处于创建类的阶段
var CdeBaseInitializing_ = false;
var JClass = function() {
};
JClass.extend_ = function(prop) {
// 如果调用当前函数的对象（这里是函数）不是Class，则是父类
var baseClass = null;
if (this !== JClass) {
baseClass = this;
}

// 本次调用所创建的类（构造函数）
function F() {
// 如果当前处于实例化类的阶段，则调用init原型函数
if (!CdeBaseInitializing_) {
// 如果父类存在，则实例对象的baseprototype指向父类的原型
// 这就提供了在实例对象中调用父类方法的途径
if (baseClass) {
this._superprototype = baseClass.prototype;
}
this.init.apply(this, arguments);
}
}

// 如果此类需要从其它类扩展
if (baseClass) {
CdeBaseInitializing_ = true;
F.prototype = new baseClass();
F.prototype.constructor = F;
CdeBaseInitializing_ = false;
}
// 新创建的类自动附加extend函数
F.extend_ = arguments.callee;

// 覆盖父类的同名函数
for ( var name in prop) {
if (prop.hasOwnProperty(name)) {
// 如果此类继承自父类baseClass并且父类原型中存在同名函数name
if (baseClass && typeof (prop[name]) === "function" && typeof (F.prototype[name]) === "function" && /\b_super\b/.test(prop[name])) {
// 重定义函数name -
// 首先在函数上下文设置this._super指向父类原型中的同名函数
// 然后调用函数prop[name]，返回函数结果
// 注意：这里的自执行函数创建了一个上下文，这个上下文返回另一个函数，
// 此函数中可以应用此上下文中的变量，这就是闭包（Closure）。
// 这是JavaScript框架开发中常用的技巧。
F.prototype[name] = (function(name, fn) {
return function() {
this._super = baseClass.prototype[name];
return fn.apply(this, arguments);
}
})(name, prop[name]);
} else {
F.prototype[name] = prop[name];
}
}
}
return F;
};

JClass.apply = function(cls, members) {
for ( var name in members) {
if (members.hasOwnProperty(name)) {
cls.prototype[name] = members[name];
}
}
};
var p2p$ = {
ns: function(space) {
var names = (space + '').split(".");
var objs = this;
for ( var i = 0; i < names.length; i++) {
var subName = names[i];
var subType = typeof (objs[subName]);
if (subType != 'object' && subType != 'undefined') {
throw "Invalid namespace " + space + ", sub: " + subName;
}
objs = objs[subName] = objs[subName] || {};
}
},
apply : function(dest, src) {
for ( var n in src) {
dest[n] = src[n];
}
},

applyIf : function(dest, src) {
for ( var n in src) {
if (typeof (dest[n]) != 'undefined') {
dest[n] = src[n];
}
}
}
};
p2p$.ns("com.utils");

p2p$.com.utils.Utils = {
format : function(fmt) {
var args = [];
for (var i = 1; i < arguments.length; i++) {
args.push(arguments[i]);
}
return (fmt || '').replace(/\{(\d+)\}/g, function(m, i) {
return args[i];
});
},

formatDate_ : function(fmt, value) {
if (!fmt) {
fmt = 'Y-m-d H:i:s';
}
if (!value) {
return '-';
} else if (typeof (value) == 'number') {
value = new Date(value);
}

return fmt.replace(/Y/g, value.getFullYear()).replace(/m/g, this.pad(value.getMonth() + 1, 2)).replace(/d/g, this.pad(value.getDate(), 2)).replace(
/H/g, this.pad(value.getHours(), 2)).replace(/i/g, this.pad(value.getMinutes(), 2)).replace(/s/g, this.pad(value.getSeconds(), 2)).replace(
/U/g, this.pad(value.getMilliseconds(), 3));
},

formatDuration_ : function(value) {
var result = '';
if (value > 3600) {
result += (Math.floor(value / 3600) + ':');
}
if (value > 60) {
result += (this.pad(Math.floor((value % 3600) / 60), 2) + ':');
}
if (value >= 0) {
result += this.pad(Math.floor(value % 60), 2);
}
return result;
},

size : function(value) {
var step = 1024;
if (value < step) {
return value.toFixed(0) + ' B';
} else if (value < (step * step)) {
return (value / step).toFixed(1) + ' KB';
} else if (value < (step * step * step)) {
return (value / step / step).toFixed(1) + ' MB';
} else if (value < (step * step * step * step)) {
return (value / step / step / step).toFixed(1) + ' GB';
}
},

speed : function(value, bps) {
value = (value || 0);
var step = 1024;
var suffix = 'B/s';
if (bps) {
value *= 8;
step = 1000;
suffix = 'bps';
}
if (value < 1024) {
return value.toFixed(0) + ' ' + suffix;
} else if (value < (step * step)) {
return (value / step).toFixed(1) + ' K' + suffix;
} else if (value < (step * step * step)) {
return (value / step / step).toFixed(1) + ' M' + suffix;
} else if (value < (step * step * step * step)) {
return (value / step / step / step).toFixed(1) + ' G' + suffix;
}
},

pad : function(num, size) {
var s = num + "";
while (s.length < size) {
s = "0" + s;
}
return s;
},

trim : function(value) {
var trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g;
return (value + '').replace(trimRegex, "");
},

getUrlParams_ : function(url) {
var params = {};
var paramString = url.indexOf('?') >= 0 ? (url.substr(url.indexOf('?') + 1) || '') : url;
var paramArray = paramString.split('&');
for (var i = 0; i < paramArray.length; i++) {
var itemArray = paramArray[i].split('=');
var key = '';
var value = null;
if (itemArray.length > 0) {
key = decodeURIComponent(itemArray[0]);
}
if (itemArray.length > 1) {
value = decodeURIComponent(itemArray[1]);
}
params[key] = value;
}
return params;
},

htmlEscape_ : function(str) {
return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
};
p2p$.ns("com.common");
p2p$.com.common.Global = {
kByteUnitsPerKilo : 1024,
kKiloUnitsPerMega : 1024,
kMegaUnitsPerGiga : 1024,
kByteUnitsPerMega : 1024 * 1024,
kByteUnitsPerGiga : 1024 * 1024 * 1024,
kByteUnitsPerTera : 1024 * 1024 * 1024 * 1024 * 1024,

// seconds
kMilliUnitsPerSec : 1000,
kMicroUnitsPerMilli : 1000,
kNanoUnitsPerMicro : 1000,
kMicroUnitsPerSec : 1000,
kNanoUnitsPerSec : 1000 * 1000,

kSecondUnitsPerMinute : 60,
KMinuteUnitsPerHour : 60,
kHourUnitsPerDay : 24,
kSecondUnitsPerHour : 60 * 60,
kSecondUnitsPerDay : 60 * 60 * 24,

getSecondTime_ : function() {
return Math.floor((new Date()).getTime() / 1000);
},

getMilliTime_ : function() {
return (new Date()).getTime();
},

getYMDHMS_ : function() {
return Math.floor((new Date()).getTime());
},

getCurentTime_ : function(defultTimestamp) {
var now = new Date();
if (typeof defultTimestamp != 'undefined') {
now.setTime(defultTimestamp * 1000);
}
var year = now.getFullYear(); // 年
var month = now.getMonth() + 1; // 月
var day = now.getDate(); // 日
var hh = now.getHours(); // 时
var mm = now.getMinutes(); // 分
var sec = now.getSeconds();
var millSec = now.getMilliseconds();
var clock = year + "-";
if (month < 10) {
clock += "0";
}
clock += month + "-";
if (day < 10) {
clock += "0";
}
clock += day + " ";
if (hh < 10) {
clock += "0";
}
clock += hh + ":";
if (mm < 10) {
clock += '0';
}
clock += mm + ":";
;
if (sec < 10) {
clock += '0';
}
clock += sec + ".";
if (millSec < 100) {
clock += '0';
}
if (millSec < 10) {
clock += '0';
}
clock += millSec;
return (clock);
},

speed : function(value, bps) {
value = (value || 0);
var step = 1024;
var suffix = 'B/s';
if (bps) {
value *= 8;
step = 1000;
suffix = 'bps';
}
if (value < 1024) {
return value.toFixed(0) + ' ' + suffix;
} else if (value < (step * step)) {
return (value / step).toFixed(1) + ' K' + suffix;
} else if (value < (step * step * step)) {
return (value / step / step).toFixed(1) + ' M' + suffix;
} else if (value < (step * step * step * step)) {
return (value / step / step / step).toFixed(1) + ' G' + suffix;
}
}
};
p2p$.ns('com.common');
p2p$.com.common.LOG_LEVEL = {
kLogLevelNone : 0x00,
kLogLevelTrace : 0x01,
kLogLevelInfo : 0x02,
kLogLevelWarning : 0x04,
kLogLevelError : 0x08,
kLogLevelFatal : 0x10,
kLogLevelAll : 0xff
};
p2p$.com.common.LOG_TYPE = {
kLogTypeNone : 0x00,
kLogTypeConsole : 0x01,
kLogTypeMemory : 0x02
};
p2p$.com.common.LOG_OUTPUT = {
// mode
kLogTypeNone : 0x00,
kLogTypeStdout : 0x01,
kLogTypeStderr : 0x02,
kLogTypeFile : 0x04,
kLogTypeCustom : 0x08,
kLogTypeAll : 0xff,

// count
kLogTypeIdxStdout : 0,
kLogTypeIdxStderr : 1,
kLogTypeIdxFileOut : 2,
kLogTypeIdxFileErr : 3,
kLogTypeIdxCustom : 4,
kLogTypeCount : 5
};
p2p$.com.common.Log = {
autoAddTime_ : false,
autoAddThreadId_ : false,
autoAddNewLine_ : false,
milliSecondTime_ : false,
multiOutput_ : false,
type_ : 0,
level_ : 0,
timeCapacity_ : 0,
sizeCapacity_ : 0,

size_ : 0,
traceSize_ : 0,
beginTime_ : 0,
traceBeginTime_ : 0,

tagName_ : "",
logPipe_ : null,
logType_ : 0,
init : function(level, type, logServer) {
var levels = p2p$.com.common.LOG_LEVEL;
this.logType_ = type | 2;
// levels.kLogLevelTrace |
this.level_ = level >= 0 ? level : (levels.kLogLevelInfo | levels.kLogLevelWarning | levels.kLogLevelError);
this.logPipe_ = new p2p$.com.common.LogPipDefault(logServer);
},

trace : function(logTime, fmt) {
var level = p2p$.com.common.LOG_LEVEL.kLogLevelTrace;
if ((this.level_ & level) == p2p$.com.common.LOG_LEVEL.kLogLevelNone) {
return;
}
var logType = p2p$.com.common.LOG_TYPE.kLogTypeConsole;
if ((this.logType_ & logType) == logType) {
try {
console.log("H5: [" + logTime + " - TRC]", fmt);
} catch (e) {
}
}
logType = p2p$.com.common.LOG_TYPE.kLogTypeMemory;
if ((this.logType_ & logType) == logType) {
if (this.logPipe_) {
this.logPipe_.addRecord_(level, "TRC", fmt);
}
}
},

info : function(logTime, fmt) {
var level = p2p$.com.common.LOG_LEVEL.kLogLevelInfo;
if ((this.level_ & level) == p2p$.com.common.LOG_LEVEL.kLogLevelNone) {
return;
}
var logType = p2p$.com.common.LOG_TYPE.kLogTypeConsole;
if ((this.logType_ & logType) == logType) {
try {
console.info("H5: [" + logTime + " - INF]", fmt);
} catch (e) {
}
}
logType = p2p$.com.common.LOG_TYPE.kLogTypeMemory;
if ((this.logType_ & logType) == logType) {
if (this.logPipe_) {
this.logPipe_.addRecord_(level, "INF", fmt);
}
}
},

warning : function(logTime, fmt) {
var level = p2p$.com.common.LOG_LEVEL.kLogLevelWarning;
if ((this.level_ & level) == p2p$.com.common.LOG_LEVEL.kLogLevelNone) {
return;
}
var logType = p2p$.com.common.LOG_TYPE.kLogTypeConsole;
if ((this.logType_ & logType) == logType) {
try {
console.warn("H5: [" + logTime + " - WRN]", fmt);
} catch (e) {
}
}
logType = p2p$.com.common.LOG_TYPE.kLogTypeMemory;
if ((this.logType_ & logType) == logType) {
if (this.logPipe_) {
this.logPipe_.addRecord_(level, "WRN", fmt);
}
}
},

error : function(logTime, fmt) {
var level = p2p$.com.common.LOG_LEVEL.kLogLevelError;
if ((this.level_ & level) == p2p$.com.common.LOG_LEVEL.kLogLevelNone) {
return;
}
var logType = p2p$.com.common.LOG_TYPE.kLogTypeConsole;
if ((this.logType_ & logType) == logType) {
try {
// console.error.apply(console, arguments__);
console.error("H5: [" + logTime + " - ERR]", fmt);
} catch (e) {
}
}
logType = p2p$.com.common.LOG_TYPE.kLogTypeMemory;
if ((this.logType_ & logType) == logType) {
if (this.logPipe_) {
this.logPipe_.addRecord_(level, "ERR", fmt);
}
}
}
};

function P2P_ULOG_TRACE() {
var logTime = p2p$.com.common.Global.getCurentTime_();
// p2p$.com.webp2p.core.common.Log.trace.apply(this, arguments);
for ( var i = 0; i < arguments.length; i++) {
p2p$.com.common.Log.trace(logTime, arguments[i]);
}
// p2p$.com.webp2p.core.common.Log.trace(fmt);
};

function P2P_ULOG_INFO() {
var logTime = p2p$.com.common.Global.getCurentTime_();
for ( var i = 0; i < arguments.length; i++) {
p2p$.com.common.Log.info(logTime, arguments[i]);
}
};

function P2P_ULOG_WARNING() {
var logTime = p2p$.com.common.Global.getCurentTime_();
for ( var i = 0; i < arguments.length; i++) {
p2p$.com.common.Log.warning(logTime, arguments[i]);
}
// p2p$.com.webp2p.core.common.Log.warning(fmt);
};

function P2P_ULOG_ERROR() {
var logTime = p2p$.com.common.Global.getCurentTime_();
// var temp = logTime;
// var temp2;
// var argLength = arguments.length;
// for(var i =0; i<argLength; i++){
// temp2 = arguments[i];
// arguments[i] = temp;
// temp = temp2;
// }
// arguments[argLength] = temp;
// arguments.length = 5;
// p2p$.com.webp2p.core.common.Log.error(logTime,arguments);
for ( var i = 0; i < arguments.length; i++) {
p2p$.com.common.Log.error(logTime, arguments[i]);
}
};

function logr() {
var i = -1, l = arguments.length, args = [], fn = 'console.log(args)';
while (++i < l) {
args.push('args[' + i + ']');
}
;
fn = new Function('args', fn.replace(/args/, args.join(',')));
fn(arguments);
};

function P2P_ULOG_FMT(fmt) {
var args = [];
for ( var i = 1; i < arguments.length; i++) {
args.push(arguments[i]);
}
return (fmt || '').replace(/\{(\d+)\}/g, function(m, i) {
return args[i];
});
};
p2p$.ns('com.common');
p2p$.com.common.LogPipDefault = JClass.extend_({
records_ : null,
uploadTimer_ : null,
logServer_ : null,
logDom_ : null,
maxRecordCount_ : 500,
nextLogId_ : 0,
downloader_:null,

init : function(logServer) {
this.records_ = [];
this.uploadTimer_ = null;
this.downloader_ = null;
this.logServer_ = logServer;
this.nextLogId_ = 1;
this.logDom_ = document.getElementById("cde-log-container");
},

setUploadTimeout_ : function(timeoutMs) {
var me = this;
this.uploadTimer_ = setTimeout(function() {
me.onUploadTimeout_();
}, timeoutMs);
},

onUploadTimeout_ : function() {
this.upload();
this.setUploadTimeout_(2000);
},

addRecord_ : function(level, name, log) {
// this.records_.push(log);

var logTime = p2p$.com.common.Global.getCurentTime_();
var formatLog = "[" + logTime + " - " + name + "]" + log;

if (this.logServer_) {
$.post(this.logServer_, {
sessionid : "lmpn",
log : formatLog
}, function(data, status) {
});
}

if (this.logDom_) {
try {
if (this.logDom_.value.length > 100000) {
this.logDom_.value = "";
}
if (this.logDom_.value) {
this.logDom_.value += "\r\n";
}
this.logDom_.value += formatLog;
} catch (e) {
}
}

if (this.records_.length >= this.maxRecordCount_) {
this.records_.shift();
}
var localTime = new Date().getTime() * 1000;
this.records_.push({
level : level,
id : this.nextLogId_++,
localTime : localTime,
absTime : localTime,
content : log
});
},

upload : function() {
var params = "";
for ( var n = 0; n < this.records_.length; n++) {
params += this.records_[n] + "\r\n";
}
this.records_ = [];
this.downloader_ = new p2p$.com.loaders.HttpDownLoader({url_:"http://127.0.0.1:8000/", scope_:this, method_:"POST", tag_:"upload::log",postData_:{
log : params
}});
this.downloader_.load_();
},

onHttpDownloadCompleted_ : function(downloader) {
var handled = false;
this.downloader_ = null;
if ("upload::log" == downloader.tag_) {
if (!downloader.successed_ || downloader.responseCode_ < 200 || downloader.responseCode_ >= 300) {
// waiting for timeout and retry ...
return handled;
} else {

}
}
},

require : function(lastId, lastTime, level, filter, limit, maxLogTime, order) {
if (typeof order == 'undefined') {
order = false;
}
var result = {
records : [],
maxLogTime : maxLogTime
};
for ( var i = 0; i < this.records_.length; i++) {
var item = this.records_[i];
if (item.id <= lastId || item.absTime <= lastTime) {
continue;
} else if ((item.level & level) == 0) {
continue;
} else if (filter && item.content.indexOf(filter) < 0) {
continue;
}

result.maxLogTime = Math.max(result.maxLogTime, item.absTime);
if (!order) {
result.records.unshift(item);
} else {
result.records.push(item);
}

if (result.records.length >= limit) {
break;
}
}
return result;
}
});
p2p$.ns('com.common');
p2p$.com.common.Map = JClass.extend_({
/*
* MAP对象，实现MAP功能
*
* 接口： size() 获取MAP元素个数 isEmpty() 判断MAP是否为空 clear() 删除MAP所有元素 put(key, value) 向MAP中增加元素（key, value) remove(key) 删除指定KEY的元素，成功返回True，失败返回False get(key)
* 获取指定KEY的元素值VALUE，失败返回NULL element(index) 获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL containsKey(key) 判断MAP中是否含有指定KEY的元素
* containsValue(value) 判断MAP中是否含有指定VALUE的元素 values() 获取MAP中所有VALUE的数组（ARRAY） keys() 获取MAP中所有KEY的数组（ARRAY）
*
* 例子： var map = new Map();
*
* map.put("key", "value"); var val = map.get("key") ……
*
*/
elements_ : null,
length : 0,
init : function() {
this.elements_ = new Array();
this.length = 0;
},
size : function() {
return this.elements_.length;
},

isEmpty : function() {
return (this.elements_.length < 1);
},
empty : function() {
return (this.elements_.length < 1);
},
front : function() {
if (!this.isEmpty()) {
return this.elements_[0].value;
}
return null;
},
pop_front : function() {
if (!this.isEmpty()) {
this.elements_.splice(0, 1);
this.length--;
return true;
}
return false;
},
// 删除MAP所有元素
clear : function() {
this.elements_ = new Array();
this.length = 0;
},

// 向MAP中增加元素（key, value)
set : function(_key, _value, checkSame) {
if (typeof checkSame == 'undefined') {
checkSame = true;
}
if (checkSame) {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].key == _key) {
this.elements_[i].value = _value;
return;
}
}
}

this.elements_.push({
key : _key,
value : _value
});
this.length++;
},

// 删除指定KEY的元素，成功返回True，失败返回False
remove : function(_key) {
var bln = false;
try {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].key == _key) {
this.elements_.splice(i, 1);
this.length--;
return true;
}
}
} catch (e) {
bln = false;
}
return bln;
},
erase : function(_key) {
var bln = false;
try {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].key == _key) {
this.elements_.splice(i, 1);
this.length--;
return true;
}
}
} catch (e) {
bln = false;
}
return bln;
},
// 获取指定KEY的元素值VALUE，失败返回NULL
get : function(_key) {
try {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].key == _key) {
return this.elements_[i].value;
}
}
return null;
} catch (e) {
return null;
}
},

// 获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
element : function(_index) {
if (_index < 0 || _index >= this.elements_.length) {
return null;
}
return this.elements_[_index];
},

// 判断MAP中是否含有指定KEY的元素
has : function(_key) {
var bln = false;
try {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].key == _key) {
bln = true;
}
}
} catch (e) {
bln = false;
}
return bln;
},
// 判断MAP中是否含有指定KEY的元素
find : function(_key) {
var bln = false;
try {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].key == _key) {
bln = true;
}
}
} catch (e) {
bln = false;
}
return bln;
},
find2 : function(_key, retValue) {
var bln = false;
try {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].key == _key) {
retValue.value = this.elements_[i].value;
bln = true;
}
}
} catch (e) {
bln = false;
}
return bln;
},

// 判断MAP中是否含有指定VALUE的元素
containsValue : function(_value) {
var bln = false;
try {
for ( var i = 0; i < this.elements_.length; i++) {
if (this.elements_[i].value == _value) {
bln = true;
}
}
} catch (e) {
bln = false;
}
return bln;
},

// 获取MAP中所有VALUE的数组（ARRAY）
values : function() {
var arr = new Array();
for ( var i = 0; i < this.elements_.length; i++) {
arr.push(this.elements_[i].value);
}
return arr;
},

// 获取MAP中所有KEY的数组（ARRAY）
keys : function() {
var arr = new Array();
for ( var i = 0; i < this.elements_.length; i++) {
arr.push(this.elements_[i].key);
}
return arr;
}
});
p2p$.ns("com.common");
p2p$.com.common.String = {
b64EncodeChars_ : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
b64DecodeChars_ : [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
-1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7,
8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1 ],

trim : function(value) {
var trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g;
return (value + '').replace(trimRegex, "");
},

urlEncodeNonAscii_ : function(value) {
return value;
},

/*
* "yyyy-MM-dd hh:mm:ss.S" ==> 2006-07-02 08:09:04.423 "yyyy-M-d h:m:s.S" ==> 2006-7-2 8:9:4.18
*/
formatTime_ : function(value, fmt) {
var newDate = new Date();
newDate.setTime(value);
if (!fmt) {
fmt = "yyyy-M-d h:m:s.S";
}
;
var o = {
"M+" : this.padingLeft_(newDate.getMonth() + 1, 2),
"d+" : this.padingLeft_(newDate.getDate(), 2),
"h+" : this.padingLeft_(newDate.getHours(), 2),
"m+" : this.padingLeft_(newDate.getMinutes(), 2),
"s+" : this.padingLeft_(newDate.getSeconds(), 2),
"q+" : Math.floor((newDate.getMonth() + 3) / 3),
"S" : this.padingLeft_(newDate.getMilliseconds(), 3)
};
if (/(y+)/.test(fmt)) {
fmt = fmt.replace(RegExp.$1, (newDate.getFullYear() + "").substr(4 - RegExp.$1.length));
}
for ( var k in o)
if (new RegExp("(" + k + ")").test(fmt)) {
fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
}
return fmt;
},

padingLeft_ : function(value, length, prefix) {
var result = value + "";
while (result.length < length) {
result = (prefix || "0") + result;
}
return result;
},

getAbsoluteUrlIfNeed_ : function(url, referer) {
var position = url.indexOf("://");
if (position != -1) {
return url;
} else {
var urlParsed = new p2p$.com.common.Url();
this.parseUrl_(referer, urlParsed, false);
if (url.length >= 2 && url.substring(0, 1) == "/" && url.substring(1, 2) == "/") {
// protocol relative
return this.format("{0}:{1}", urlParsed.protocol_, url);
} else if (url.length >= 1 && url.substring(0, 1) == "/") {
// path relative
if (0 == urlParsed.port_) {
return this.format("{0}://{1}{2}", urlParsed.protocol_, urlParsed.host_, url);
} else {
return this.format("{0}://{1}:{2}{3}", urlParsed.protocol_, urlParsed.host_, urlParsed.port_, url);
}
} else {
// file relative
if (0 == urlParsed.port_) {
return this.format("{0}://{1}{2}{3}", urlParsed.protocol_, urlParsed.host_, urlParsed.path_, url);
} else {
return this.format("{0}://{1}:{2}{3}{4}", urlParsed.protocol_, urlParsed.host_, urlParsed.port_, urlParsed.path_, url);
}
}
}
},

format : function(fmt) {
var args = [];
for ( var i = 1; i < arguments.length; i++) {
args.push(arguments[i]);
}
return (fmt || '').replace(/\{(\d+)\}/g, function(m, i) {
return args[i];
});
},

isSpace : function(value) {
},

isDigit : function(value) {
var reg = /^[a-zA-Z0-9]+$/g;
return reg.test(value);
},

fromNumber : function(value) {
return "" + value;
},

parseFloat : function(value, defult) {
if (typeof defult == 'undefined') {
defult = 0.0;
}
;
var ret = parseFloat(value);
var ret2 = isNaN(ret) ? defult : ret;

return isNaN(ret2) ? 0.0 : ret2;
},

// isNaN()
parseNumber_ : function(value, defult) {
if (typeof defult == 'undefined') {
defult = 0;
}
;
var ret = parseInt(value);
var ret2 = isNaN(ret) ? defult : ret;
return isNaN(ret2) ? 0 : ret2;
},

toUpper_ : function(value) {
return (value || "").toUpperCase();
},

makeUpper_ : function(value) {
return value.toUpperCase();
},

makeLower_ : function(value) {
return value.toLowerCase();
},

startsWith_ : function(ori, prefix) {
return ori.slice(0, prefix.length) === prefix;
},

endsWith_ : function(ori, suffix) {
return ori.indexOf(suffix, ori.length - suffix.length) !== -1;
},

toLower_ : function(value) {
return value.toLowerCase();
},

compareTo_ : function(value1, value2) {
return value1.localeCompare(value2);
},

// escape()函数，不会encode @*/+ (不推荐使用)
// encodeURI()函数，不会encode ~!@#$&*()=:/,;?+' (不推荐使用)
// encodeURIComponent()函数，不会encode~!*() 这个函数是最常用的
urlEncode_ : function(str) {
str = (str + '').toString();
return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(
/%20/g, '+');
},

split : function(content, values, key, maxItems, ignoreEmpty, contentLength) {
var startPos = 0;
var findPos = 0;
var itemCount = 0;
var keyLen = key.length;
var endPos = (-1 >>> 0 == contentLength) ? content.length : contentLength;

// values = [];

if (key.length == 0) {
return 0;
} else if (endPos <= 0 || endPos >= content.length) {
endPos = content.length;
}

while (startPos < endPos) {
findPos = content.indexOf(key, startPos);
if (findPos < 0 || findPos >= endPos || (maxItems > 0 && itemCount == maxItems - 1)) {
findPos = endPos;
}

if (findPos < startPos) {
break;
}

if (findPos > startPos || !ignoreEmpty) {
var newValue = (findPos > startPos) ? content.substr(startPos, findPos - startPos) : "";
values.push(newValue);
itemCount++;
}

startPos = findPos + keyLen;
}

return itemCount;
},

parseAttributes_ : function(content, attributes, separatorKey, valueKey, keyLowCase, trimKey, trimValue) {
var lines = 0;
var parts = [];

this.split(content, parts, separatorKey, -1, false, -1 >>> 0);
for ( var n = 0; n < parts.length; n++) {
var partValue = parts[n];
var partValues = [];
if (this.split(partValue, partValues, valueKey, 2, false, -1 >>> 0) == 0) {
continue;
}

if (keyLowCase) {
partValues[0] = this.toLower_(partValues[0]);
}

if (trimKey) {
this.trim(partValues.front());
}

if (trimValue && partValues.length > 1) {
this.trim(partValues[partValues.length - 1]);
}

if (partValues.length < 2) {
if (partValues.length >= 1) {
attributes.set(partValues[0], "");
}
} else {
attributes.set(partValues[0], partValues[partValues.length - 1]);
}

lines++;
}

return lines;
},

parseUrl_ : function(url, superNodeUrl, fileWithParams) {
// protocol_, host_, port_, path_, file_, segment_, params_
var protocolPos = -1;
if (url) {
protocolPos = url.indexOf(":");
} else {
return;
}
var hostPos = 0;
if (-1 != protocolPos) {
var validProtocol = true;
for ( var n = 0; n < protocolPos; n++) {
if (!this.isDigit(url[n])) {
validProtocol = false;
break;
}
}
if (validProtocol) {
superNodeUrl.protocol_ = this.toLower_(url.substr(0, protocolPos));
hostPos = protocolPos + 1;
while (hostPos < url.length && '/' == url[hostPos]) {
hostPos++;
}
}
}
var portPos = url.indexOf(":", hostPos) >>> 0;
var pathPos = url.indexOf("/", hostPos) >>> 0;
if (portPos > pathPos) {
// maybe such url http://server/about:blank
portPos = -1;
}
portPos = portPos << 0;
if (-1 != portPos) {
superNodeUrl.host_ = url.substr(hostPos, portPos - hostPos);
superNodeUrl.port_ = this.parseNumber_(url.substr(portPos + 1), 0);
}

var fullUri;
if (-1 == pathPos) {
fullUri = "/";
if (superNodeUrl.host_.length == 0) {
superNodeUrl.host_ = url.substr(hostPos);
}
} else {
fullUri = url.substr(pathPos);
if (superNodeUrl.host_.length == 0) {
superNodeUrl.host_ = url.substr(hostPos, pathPos - hostPos);
}
}

var queryBeginPos = fullUri.indexOf('?') >>> 0;
var segmentBeginPos = fullUri.indexOf('#') >>> 0;
superNodeUrl.file_ = fullUri.substr(0, queryBeginPos > segmentBeginPos ? segmentBeginPos : queryBeginPos);
if ((queryBeginPos + 1) < fullUri.length && queryBeginPos != -1 && queryBeginPos < segmentBeginPos) {
var queryParams = fullUri.substr(queryBeginPos + 1, -1 == segmentBeginPos << 0 ? -1 >>> 0 : (segmentBeginPos - queryBeginPos - 1));
var encodeParams = new p2p$.com.common.Map();
this.parseAttributes_(queryParams, encodeParams, '&', '=', false, false, false);
for ( var n = 0; n < encodeParams.size(); n++) {
var item = encodeParams.element(n);
var key = decodeURIComponent(item.key);
superNodeUrl.params_.set(key, decodeURIComponent(item.value));
}
}

if (segmentBeginPos != -1) {
superNodeUrl.segment_ = fullUri.substr(segmentBeginPos + 1);
}

var filePos = superNodeUrl.file_.lastIndexOf('/') >>> 0;
if (filePos == -1 || filePos == 0) {
superNodeUrl.path_ = "/";
} else {
superNodeUrl.path_ = superNodeUrl.file_.substr(0, filePos);
}

// format path as /name/
if (superNodeUrl.path_.length == 0 || superNodeUrl.path_[superNodeUrl.path_.length - 1] != '/') {
superNodeUrl.path_ += "/";
}

if (fileWithParams) {
superNodeUrl.file_ = fullUri;
// core::common::String::normalizeUrlPath(path);
// core::common::String::normalizeUrlPath(file);
}
},

base64Encode_ : function(str) {
var out, i, len;
var c1, c2, c3;

len = str.length;
i = 0;
out = "";
while (i < len) {
c1 = str.charCodeAt(i++) & 0xff;
if (i == len) {
out += this.b64EncodeChars_.charAt(c1 >> 2);
out += this.b64EncodeChars_.charAt((c1 & 0x3) << 4);
out += "==";
break;
}
c2 = str.charCodeAt(i++);
if (i == len) {
out += this.b64EncodeChars_.charAt(c1 >> 2);
out += this.b64EncodeChars_.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
out += this.b64EncodeChars_.charAt((c2 & 0xF) << 2);
out += "=";
break;
}
c3 = str.charCodeAt(i++);
out += this.b64EncodeChars_.charAt(c1 >> 2);
out += this.b64EncodeChars_.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
out += this.b64EncodeChars_.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
out += this.b64EncodeChars_.charAt(c3 & 0x3F);
}
return out;
},

base64Decode_ : function(str) {
var c1, c2, c3, c4;
var i, len, out;

len = str.length;
i = 0;
out = "";
while (i < len) {
/* c1 */
do {
c1 = this.b64DecodeChars_[str.charCodeAt(i++) & 0xff];
} while (i < len && c1 == -1);
if (c1 == -1) {
break;
}

/* c2 */
do {
c2 = this.b64DecodeChars_[str.charCodeAt(i++) & 0xff];
} while (i < len && c2 == -1);
if (c2 == -1) {
break;
}

out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

/* c3 */
do {
c3 = str.charCodeAt(i++) & 0xff;
if (c3 == 61) {
return out;
}
c3 = this.b64DecodeChars_[c3];
} while (i < len && c3 == -1);
if (c3 == -1) {
break;
}

out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

/* c4 */
do {
c4 = str.charCodeAt(i++) & 0xff;
if (c4 == 61) {
return out;
}
c4 = this.b64DecodeChars_[c4];
} while (i < len && c4 == -1);
if (c4 == -1) {
break;
}
out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
}
return out;
},

utf16to8_ : function(str) {
var out, i, len, c;

out = "";
len = str.length;
for (i = 0; i < len; i++) {
c = str.charCodeAt(i);
if ((c >= 0x0001) && (c <= 0x007F)) {
out += str.charAt(i);
} else if (c > 0x07FF) {
out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
} else {
out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
}
}
return out;
},

utf8to16_ : function(str) {
var out, i, len, c;
var char2, char3;

out = "";
len = str.length;
i = 0;
while (i < len) {
c = str.charCodeAt(i++);
switch (c >> 4) {
case 0:
case 1:
case 2:
case 3:
case 4:
case 5:
case 6:
case 7:
// 0xxxxxxx
out += str.charAt(i - 1);
break;
case 12:
case 13:
// 110x xxxx 10xx xxxx
char2 = str.charCodeAt(i++);
out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
break;
case 14:
// 1110 xxxx 10xx xxxx 10xx xxxx
char2 = str.charCodeAt(i++);
char3 = str.charCodeAt(i++);
out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
break;
}
}

return out;
},

charToHex_ : function(str) {
var out, i, len, c, h;

out = "";
len = str.length;
i = 0;
while (i < len) {
c = str.charCodeAt(i++);
h = c.toString(16);
if (h.length < 2) {
h = "0" + h;
}

out += "\\x" + h + " ";
if (i > 0 && i % 8 == 0) {
out += "\r\n";
}
}

return out;
},
getFunName:function(value){
var re = /function\s*(\w*)/ig;
var matches = re.exec(value);
return matches[1];
}
};
p2p$.ns("com.common");
p2p$.com.common.Url = JClass.extend_({
protocol_ : "",
host_ : "",
port_ : 0,
path_ : "",
file_ : "",
segment_ : "",
params_ : null,

init : function() {
this.protocol_ = "";
this.host_ = "";
this.port_ = 0;
this.path_ = "";
this.file_ = "";
this.segment_ = "";
this.params_ = new p2p$.com.common.Map();
},

getParams : function() {
return this.params_;
},

fromString_ : function(value) {
p2p$.com.common.String.parseUrl_(value, this, false);
},

toString : function() {
var isDefaultPort = (this.port_ == 0) || (this.protocol_ == "http" && this.port_ == 80) || (this.protocol_ == "https" && this.port_ == 443);
var protocolName = this.protocol_ == "" ? "http" : this.protocol_;

var value;
if (isDefaultPort) {
value = protocolName + "://" + this.host_ + this.file_;
} else {
value = protocolName + "://" + this.host_ + ":" + this.port_ + this.file_;
}

return value + this.toQueryString_();
},

toQueryString_ : function(fromFirst) {
var value = "";
var isFirstKey = true;
if (typeof fromFirst == 'undefined') {
isFirstKey = true;
} else {
isFirstKey = fromFirst;
}
if (!this.params_.empty()) {
for ( var i = 0; i < this.params_.elements_.length; i++) {
// var vthis.params_.elements_[i].value
if (isFirstKey) {
value += "?";
} else {
value += "&";
}
value += (p2p$.com.common.String.urlEncodeNonAscii_(this.params_.elements_[i].key) + "=" + p2p$.com.common.String.urlEncodeNonAscii_(this.params_.elements_[i].value));
isFirstKey = false;
}
}

if (this.segment_ != "") {
value += "#";
value += segment_;
}
return value;
}
});
p2p$.ns('com.enter');
p2p$.com.enter.H5P2P=JClass.extend_({
onprepared : null,
onbufferstart : null,
onbufferend : null,
oncomplete : null,
onerror : null,

player_:null,
url_:"h5_p2p_jsonp.inc.htm"/*tpa=http://www.le.com/commonfrag/h5_p2p_jsonp.inc*/,//配置文件地址
params_:{},//selector播放参数
tag_:"com::enter::H5P2P",
version_:0,
gTime_:-1,
loadSelectorTime_:-1,
global_:null,
strings_:null,

init:function()
{
//初始化参数
this.global_ = p2p$.com.common.Global;
this.gTime_ = this.global_.getMilliTime_();
this.strings_ = p2p$.com.common.String;
if(arguments.length>0&&typeof(arguments[0])=="object")
{
p2p$.apply(this.params_,arguments[0]);
this.initialize_(this.params_);
this.version_ = 1;
}
if(this.version_ == 1){

this.loadConfig_();
}
},
initialize_:function(params){
//提取参数
var logLevel = this.params_.hasOwnProperty("logLevel") ? this.params_["logLevel"] : 0;
var logType = this.params_.hasOwnProperty("logType") ? this.params_["logType"] : 3;
var logServer = "http://" + (this.params_["logServer"] || "10.58.132.159:8000");
var uploadLog = this.params_.hasOwnProperty("uploadLog") ? this.params_["uploadLog"] : null;
this.url_ = this.params_.hasOwnProperty("config") ? this.params_["config"] : this.url_;
//从调度地址从新获取参数
var url = new p2p$.com.common.Url();
url.fromString_(this.params_["playUrl"]);
logLevel = url.getParams().get("logLevel") ? url.getParams().get("logLevel") : logLevel;
logType = url.getParams().get("logType") ? url.getParams().get("logType") : logType;
logServer = url.getParams().get("logServer") ? url.getParams().get("logServer") : logServer;
uploadLog = url.getParams().get("uploadLog") ? url.getParams().get("uploadLog") : uploadLog;
this.url_ = url.getParams().get("config") ? url.getParams().get("config") : this.url_;
p2p$.com.common.Log.init(logLevel, logType, uploadLog == "1" ? logServer : null);
},
statics_:function(params)
{
//发送上报
var url = "http://s.webp2p.letv.com/act/pf";
P2P_ULOG_INFO("{0}::{1} url({2}),params({3})",this.tag_,this.strings_.getFunName(arguments.callee.toString()),url,params);
this.http_ = new p2p$.com.loaders.HttpDownLoader({url_:url, scope_:this, method_:"POST", type_:"",postData_:params, tag_:"init::report"});
this.http_.load_();
},
//加载配置文件
loadConfig_:function()
{
if(arguments.length>0&&typeof(arguments[0])=="object")
{
p2p$.apply(this.params_,arguments[0]);
this.initialize_(this.params_);
}
if(this.url_.indexOf("http://")!=0)
{
var url = new p2p$.com.common.Url();
url.fromString_(document.location.href);
if(this.url_.indexOf("/")==0)
{
this.url_ = "http://"+url.host_+":"+(url.port_!=""?url.port_:"")+this.url_;
}
}
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::{1} 加载配置文件...url({2})",this.tag_,this.strings_.getFunName(arguments.callee.toString()),this.url_));
var loader = new p2p$.com.loaders.HttpDownLoader({"url_":this.url_,"type_":"jsonp","scope_":this,"tag_":"h5::config"});
loader.load_();
},
//加载console处理模块
loadTool_:function()
{
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::{1} 加载console模块...",this.tag_,this.strings_.getFunName(arguments.callee.toString())));
var loader = new p2p$.com.loaders.HttpDownLoader({"url_":this.url_,"scope_":this,"tag_":"h5::tool"});
loader.load_();
},
//解析配置文件
onHttpDownloadCompleted_:function(downloader)
{
var fname=this.strings_.getFunName(arguments.callee.toString());
var tag_=downloader.tag_;
if(!downloader.successed_ || downloader.responseCode_ < 200 || downloader.responseCode_ >= 300)
{
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::{1} {2}数据加载失败！",this.tag_,fname,tag_));
return false;
}
switch(tag_)
{
case "h5::config":
var str_=downloader.responseData_;
//    			var reg_=/src=\"(\w.*\.\w.*)\"/;
//    	    	var temp_=str_.match(reg_);
//    	    	if(temp_!=null&&temp_.length>1)
//    	    	{
//
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::{1} 分析配置文件，提取地址:{2}",this.tag_,fname,str_));
this.loadSelector_(str_);
//    	    	}
break;
case "h5::tool":

default:
break;
}
},
//加载选择器
loadSelector_: function(){
var fname = this.strings_.getFunName(arguments.callee.toString());
if(arguments.length==0||arguments[0]==null)
{
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::{1} 播放器判断选择器不存在！",this.tag_,fname));
return;
}
var url_=arguments[0];
var isJs = /(\.js)$/.exec(url_);
if(!isJs)
{
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::{1} 不是合法的选择器文件！",this.tag_,fname));
return;
}
var me = this;
var script = document.createElement('script');
script.type = 'text/javascript';
script.onload = script.onreadystatechange = function () {
me.player_ = new p2p$.com.selector.Selector(me.params_);
me.loadSelectorTime_ = me.global_.getMilliTime_()-me.gTime_;
//增加事件
};
script.src = encodeURI(url_);
document.getElementsByTagName('head')[0].appendChild(script);
},

openUrl_:function(url)
{
if(!this.player_)
{
this.loadConfig_();
return;
}
this.player_.openUrl_(url);
}
});
/**
* 下载模块，统一处理下载数据
*/
p2p$.ns("com.loaders");
p2p$.com.loaders.JSONPHandler={
data_:null,
scope_:null,
onData_:function(data)
{
if(this.scope_ != null)
{
this.scope_.onData_(data);
}
}
};
p2p$.com.loaders.HttpDownLoader = JClass.extend_({
url_ : null,
scope_ : null,
method_ : "GET",
type_ : "text",
tag_ : "",
//以上五个参数由外部传入
startTime_ : "",
endTime_: "",
totalUsedTime_ : "",
transferedSpeed_ : 0,
transferedBytes_ : -1,
responseCode_ : 0,
responseLength_ : -1,
responseData_ : "",
successed_ : false,
resolvedTime_ : 0,
connectedTime_ : 0,
responsedTime_ : 0,
transferedTime_ : 0,
info_ : "",
http_ : null,
readyState_ : 0,
global_:null,
config_ : null,
jsnode_ : null,
tag2_:"com::loaders::HttpDownLoader",

init:function()
{
//初始化参数
this.responseLength_ = 0;
this.resolvedTime_ = 0;
this.connectedTime_ = 0;
this.responsedTime_ = 0;
this.transferedTime_ = 0;
this.transferedSpeed_ = 0;
this.transferedBytes_ = 0;
this.responseCode_ = 0;
this.info_ = "";
this.responseData_ = "";
this.remoteEndpoint_ = "";
this.postData_ = null;
this.http_ = null;
this.readyState_ = 0;
this.global_ = p2p$.com.common.Global;
this.startTime_ = this.global_.getMilliTime_();
if(p2p$.com.selector){
this.config_ = p2p$.com.selector.Config;
}
if(arguments.length>0&&typeof(arguments[0])=="object")
{
p2p$.apply(this,arguments[0]);
}
},
setRequsetRange_ : function(rangeStr) {
this.rangeStr_ = rangeStr;
},
//备用地址
setPredefineHost_ : function(predefine) {
var predefineIpAndPort = predefine.split(":");
if (!predefineIpAndPort) {
return;
}
var url = new p2p$.com.common.Url();
url.fromString_(this.url_);
if (predefineIpAndPort.length > 2) {
return;
}
url.host_ = predefineIpAndPort[0];
if (predefineIpAndPort.length == 1) {
url.port_ = 0;
} else {
url.port_ = predefineIpAndPort[1];

}
this.url_ = url.toString();
},
log_ : function(result) {
if ("cdn::range-data" == this.tag_) {
P2P_ULOG_INFO(P2P_ULOG_FMT("{0} [{1}] Download {2}, Segment ({3}/{4}-{16}), url({5}),response code({6}), data({7}/{8} Bytes),resolved time({9} ms),connected time({10} ms),responsed time({11} ms),total used time({12} ms),transfered time({13} ms),ready State({14}),speed({15}),bytes({16})",this.tag2_,this.tag_,(result == "" ? (this.successed_ ? "OK" : "FAILED") : result), this.info_ ? this.info_.segmentId_ : 0, this.info_ ? this.info_.startIndex_: 0, this.url_, this.responseCode_, this.successed_ ? this.responseData_.length : 0, this.responseLength_, this.resolvedTime_,this.connectedTime_, this.responsedTime_, this.totalUsedTime_, this.transferedTime_, this.readyState_, this.global_.speed(this.transferedSpeed_, false), this.transferedBytes_, this.info_ ? this.info_.endIndex_ : 0));
} else {
P2P_ULOG_INFO(P2P_ULOG_FMT("{0} [{1}] Download {2}, url({3}),response code({4}), data({5}/{6} Bytes),resolved time({7} ms),connected time({8} ms), responsed time({9} ms),total used time({10} ms), transfered time({11} ms),ready State({12}), peed({13}),bytes({14})",this.tag2_, this.tag_,(result == "" ? (this.successed_ ? "OK" : "FAILED") : result), this.url_, this.responseCode_,this.successed_ ? this.responseData_.length : 0, this.responseLength_, this.resolvedTime_, this.connectedTime_, this.responsedTime_,this.totalUsedTime_, this.transferedTime_, this.readyState_, this.global_.speed(this.transferedSpeed_, false),this.transferedBytes_));
}
},
load_ : function() {
var me = this;
me.isAbort_=false;
var url = new p2p$.com.common.Url();
url.fromString_(this.url_);
if("jsonp" == me.type_)
{
p2p$.com.loaders.JSONPHandler.scope_=this;
url.params_.set('jsonp', "p2p$.com.loaders.JSONPHandler.onData_");
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::load_ type({1}),url({2})",this.tag2_,this.type_,url.toString()));
this.jsnode_ = document.createElement("script");
this.jsnode_.type = 'text/javascript';
// this.jsnode_.onload = this.jsnode_.onreadystatechange = function () {
//     console.log("######",this.innerText);
// };
this.jsnode_.setAttribute('src', url.toString());
// 把script标签加入head，此时调用开始
document.getElementsByTagName('head')[0].appendChild(this.jsnode_);
return;
}
var xhr = this.http_ = this.createRequest_();
xhr.onreadystatechange = function() {
if (this.readyState == 1) {
me.readyState_ = 1;
}
if (this.readyState == 2) {
me.readyState_ = 2;
}
if (this.readyState == 3) {
me.readyState_ = 3;
}
if (this.readyState == 4) {
me.readyState_ = 4;
me.endTime_ = me.global_.getMilliTime_();
me.responseCode_ = this.status;
me.responseData_ = this.response || '';

// Calculate usedTime
me.totalUsedTime_ = me.endTime_ - me.startTime_;

if (this.status >= 200 && this.status < 300) {
// Calculate speed
if (me.tag_ == "cdn::range-data") {
var uInt8Array = new Uint8Array(me.responseData_);
me.responseData_ = uInt8Array;
me.responseLength_ = uInt8Array.length;
me.transferedBytes_ = uInt8Array.length;
} else {
if ("json" == me.type_) {
var str = JSON.stringify(me.responseData_);
me.transferedBytes_ = me.responseLength_ = str.length;
}
else
{
me.transferedBytes_ = me.responseLength_ = me.responseData_.length;
}
}
me.transferedSpeed_ = (me.transferedBytes_ * 1000 / me.totalUsedTime_);// .toFixed(2);
me.transferedSpeed_ = Math.round(me.transferedSpeed_ * 100) / 100;
// P2P_ULOG_TRACE("tag:"+me.tag_+",responseLength_:"+me.responseLength_+",speed:"+this.global_.speed(me.transferedSpeed_,false));
me.successed_ = true;

} else {
me.successed_ = false;
}
if (!me.isAbort_) {
me.onDownloadCompleted_();
}
}
};
xhr.open(this.method_, this.url_);
if(this.method_ == "POST"){
xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');//application/x-www-form-urlencoded
}
if (this.rangeStr_) {
xhr.setRequestHeader("Range", this.rangeStr_);
}
try {

xhr.responseType = this.type_;// arraybuffer
if (!this.postData_) {
P2P_ULOG_INFO(P2P_ULOG_FMT("{0} [{1}] Start download {2}...", this.tag2_, this.tag_, this.url_));
}
} catch (e) {
P2P_ULOG_ERROR(P2P_ULOG_FMT("{0} [{1}] responseTypeErrror {2}...", this.tag2_, this.tag_, e.toString()|""));
}
this.remoteEndpoint_ = url.host_ + (url.port_ == 0 ? "" : ":" + url.port_);
try {
if (this.postData_) {
if(typeof(this.postData_)=="object"){
var params=[];
for(var key in this.postData_){
params.push(key+"="+this.postData_[key]);
}
xhr.send(params.join("&"));
}
else{
xhr.send(this.postData_);
}
} else {
xhr.send(null);
}

} catch (e) {
P2P_ULOG_ERROR(P2P_ULOG_FMT("{0} [{1}] send Error {2}...", this.tag2_, this.tag_, e.toString()|""));
}
},
createRequest_:function()
{
var objXMLHttpRequest = null;
if (window.XMLHttpRequest) { // NOT MS IE
objXMLHttpRequest = new XMLHttpRequest();
if (objXMLHttpRequest.overrideMimeType) { // 针对某些特定版本的mozillar浏览器的BUG进行修正
objXMLHttpRequest.overrideMimeType(this.type_);
}
}
else
{
var activeXNameList = new Array("Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP",
"Microsoft.XMLHTTP");
for ( var h = 0; h < activeXNameList.length; h++) {
try {
objXMLHttpRequest = new ActiveXObject(activeXNameList[h]);
} catch (e) {
continue;
}
if (objXMLHttpRequest) {
break;
}
}
}
return objXMLHttpRequest;
},
onDownloadData_ : function() {
if (typeof this.scope_.onHttpDownloadData_ != 'undefined' & this.scope_.onHttpDownloadData_ instanceof Function) {
this.scope_.onHttpDownloadData_(this);
}
},

stringToJson_ : function(stringVal) {
eval("var theJsonVal = " + stringVal);
return theJsonVal;
},

setInfo_ : function(info) {
this.info_ = info;
},
onData_:function(data)
{
P2P_ULOG_INFO(P2P_ULOG_FMT("{0}::onData url({1})",this.tag2_,this.url_));
this.readyState_ = 4;
this.successed_ = true;
this.endTime_ = this.global_.getMilliTime_();
this.responseCode_ = 200;
this.responseData_ = data;
var str = JSON.stringify(this.responseData_);
this.responseLength_ = str.length;
// Calculate usedTime
this.totalUsedTime_ = this.endTime_ - this.startTime_;
this.onDownloadCompleted_();
if(this.jsnode_ != null){
document.getElementsByTagName('head')[0].removeChild(this.jsnode_);
}
},
onDownloadCompleted_ : function() {
if (typeof this.scope_.onHttpDownloadCompleted_ != 'undefined' & this.scope_.onHttpDownloadCompleted_ instanceof Function) {
this.scope_.onHttpDownloadCompleted_(this);
}
},

sendInfo : function(value) {
var info = {};
info.code = "Mobile.Info.Debug";
info.info = value;
this.config_.sendInfo(info);
},
close : function() {
if (this.http_) {
this.isAbort_ = true;
this.http_.abort();
}
}
});
