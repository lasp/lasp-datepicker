
(function() {

'use strict'

function DatepickerBase(scope, elem) {

    this.scope = scope;
    this.elem = elem;

    scope.model = {
        validationError: undefined,

        startDateStyle: this.STYLE_VALID,
        endDateStyle: this.STYLE_VALID,
    }
}

// Everything in this constants object will
// be copied to both the DatepickerBase and
// its prototype, so that they're available
// both statically and as a part of the
// instances.
var constants = {
    "STYLE_VALID": {
        'background-color': '#fff'
    },
    "STYLE_INVALID": {
        'background-color': '#fee'
    },

    ISO_STANDARD_FORMAT: 'YYYY-MM-DD',
    ISO_ORDINAL_FORMAT: 'YYYY-DDDD',

    TIMEZONES: [ 'utc', 'local' ]
};

constants.TIME_FORMATS = [
    constants.ISO_STANDARD_FORMAT,
    constants.ISO_ORDINAL_FORMAT
];

Object.keys(constants).forEach(function( key ) {
    DatepickerBase[key] = DatepickerBase.prototype[key] = constants[key];
});

DatepickerBase.prototype.resetValidation = function() {
    this.scope.model.validationError = undefined;
    this.scope.model.startDateStyle = this.STYLE_VALID;
    this.scope.model.endDateStyle = this.STYLE_VALID;
};

var dateFnsToWrap = [
    "getUTCDate",
    "getUTCDay",
    "getUTCFullYear",
    "getUTCHours",
    "getUTCMilliseconds",
    "getUTCMinutes",
    "getUTCMonth",
    "getUTCSeconds",
    "setUTCDate",
    "setUTCFullYear",
    "setUTCHours",
    "setUTCMilliseconds",
    "setUTCMinutes",
    "setUTCMonth",
    "setUTCSeconds",
    "toUTCString"
];

// The JS Date object provides several pairs of utc/local functions,
// with a naming convention like "getFullYear" and "getUTCFullYear".
// Here, we populate DatepickerBase.prototype with dynamic 'switcher'
// functions that will automatically choose the right function from
// the pair based on the value of this.scope.timezone. Each 'switcher'
// function takes a JS Date as the first argument, and will pass on
// and remaining arguments after the 1st to whichever underlying
// function it eventually calls.
//
// So, for example, calling
// myDatepickerBase.setDate( myJsDate, 3 )
// is equivalent to
// myJsDate.setDate( 3 )
// if
// myDatepickerBase.scope.timezone === 'local'
// and is equivalent to
// myJsDate.setUTCDate(3)
// if
// myDatepickerBase.scope.timezone === 'utc'
dateFnsToWrap.forEach(function(utcFnName) {
    var localFnName = utcFnName.replace('UTC', '');

    var utcFn = Date.prototype[utcFnName];
    var localFn = Date.prototype[localFnName];

    DatepickerBase.prototype[localFnName] = function( date ) {
        var remainingArgs = Array.prototype.slice.call(arguments, 1); // all arguments to this function except the 1st
        var fnToCall = this.scope.timezone === 'utc' ? utcFn : localFn;
        return fnToCall.apply(date, remainingArgs);
    };
})

angular.module( 'laspDatePicker' ).service( 'datepickerBase', [ function() { return DatepickerBase; } ]);

})();