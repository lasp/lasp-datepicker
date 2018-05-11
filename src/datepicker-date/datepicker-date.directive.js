
(function() {

var dependencies = [
    'datepickerBase',
    'momentStrict'
];

function datepickerDirectiveFn(DatepickerBase, momentStrict) {
    return {
        restrict: 'E',
        templateUrl: 'datepicker-date/datepicker-date.template.html',
        scope: {
            config: '=',
            date: '=',
            onPopupOpen: '&',
            onPopupClose: '&',
            onError: '&'
        },
        link: function(scope, element) {
            var datepickerBase = new DatepickerBase(scope, element);

            if( typeof scope.config.timezone === 'undefined' ) {
                throw 'You must pass scope.config.timezone to <datepicker-date>. This tells the directive how to interpret the JS Date objects in `scope.date` that you provide.'
            }
            else if ( datepickerBase.TIMEZONES.indexOf(scope.config.timezone) === -1 ) {
                throw 'Unrecognized value for scope.config.timezone: "' + scope.config.timezone + '"';
            }

            scope.config.timeFormat = (DatepickerBase.TIME_FORMATS.indexOf(scope.config.timeFormat) === -1)
                ? DatepickerBase.ISO_STANDARD_FORMAT
                : scope.config.timeFormat;

            angular.extend(
                scope,
                {
                    // This is *the* authoritative model for our
                    // datepicker. The proverbial buck stops here.
                    // When other information disagrees with the
                    // authoritative information, the authoritative
                    // information wins.
                    //
                    // This pair of objects intentionally does not
                    // contain time or timezone information, because
                    // that is more specificity than our interface
                    // presents to the user.
                    //
                    // By its nature this object has 'day' precision.
                    // A JS Date object has 'millisecond' precision.
                    // Therefore, in order to create a JS Date object
                    // from the authoritative object, you will have
                    // to find or invent some extra information.
                    // The onus is on you to do that conversion
                    // in a way that makes sense.
                    authoritative: {
                        start: {
                            year: -1,
                            month: -1,
                            day: -1
                        },
                        end: {
                            year: -1,
                            month: -1,
                            day: -1
                        }
                    },

                    // This object contains other objects that are
                    // calculated from the authoritative object.
                    // When extra information must be invented for
                    // the calculation (e.g. for creating JS Date
                    // objects) we must be explicit about how we
                    // do that.
                    calculated: {

                        // string created according to scope.config.timeFormat
                        str: {
                            start: '',
                            end: ''
                        },

                        // JS Date created by interpreting authoritative
                        // as midnight, utc.
                        jsDateMidnightUtc: {
                            start: null,
                            end: null
                        },

                        // JS Date created by interpreting authoritative
                        // as midnight local time. It is important to note that
                        // this refers to a different millisecond than
                        // jsDateMidnightUtc and is not simply a
                        // different representation of the same time.
                        jsDateMidnightLocal: {
                            start: null,
                            end: null
                        }
                    },

                    model: {
                        dateOpenedStart: false,
                        dateOpenedEnd: false
                    }
                }
            );

            // http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
            var isValidDate = function(d) {
                return Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime());
            };

            var capitalize = function(word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            };

            // return true if scope.authoritative.start is strictly
            // before scope.authoritative.end, else false.
            var startIsBeforeEnd = function() {
                var start = scope.authoritative.start;
                var end = scope.authoritative.end;

                if( start.year < end.year ) { return true; }
                if( start.year > end.year ) { return false; }

                // years are equal, now test months
                if( start.month < end.month ) { return true; }
                if( start.month > end.month ) { return false; }

                // years and months are equal, now test days
                if( start.day < end.day ) { return true; }
                if( start.day > end.day ) { return false; }

                // year, month, and day are all equal
                // return false because start is not strictly less than end
                return false;
            };

            // Remove all validation error messages and styles
            var resetValidation = function() {
                scope.model.validationError = null;
                scope.onError({ error: null });
                scope.model.startDateStyle = datepickerBase.STYLE_VALID;
                scope.model.endDateStyle = datepickerBase.STYLE_VALID;
            };

            // Set the error message and apply STYLE_INVALID to
            // the appropriate input specified by `which`
            // ('start', 'end' or 'both')
            var setValidationError = function(which, errMsg) {
                if( !scope.model.validationError ) {
                    scope.model.validationError = errMsg;
                    scope.onError({ error: scope.model.validationError });

                    if( which === 'start' || which === 'both' ) {
                        scope.model.startDateStyle = datepickerBase.STYLE_INVALID;
                    }
                    if( which === 'end' || which === 'both') {
                        scope.model.endDateStyle = datepickerBase.STYLE_INVALID;
                    }
                }
            };

            // Miscellaneous global-ish validation checks. Since most
            // parsing errors should be handled in our onChange handlers,
            // there isn't a ton to put here.
            var performValidationChecks = function() {
                if( !startIsBeforeEnd() ) {
                    setValidationError('both', 'Please enter a start time that falls before the end time');
                }
            };

            var toggleModelVariable = function($event, key) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.model[key] = !scope.model[key];
            };
            scope.toggleStartPicker = function( $event ) { toggleModelVariable( $event, 'dateOpenedStart' ); };
            scope.toggleEndPicker = function( $event ) { toggleModelVariable( $event, 'dateOpenedEnd' ); };

            // Trigger the onPopupOpen/onPopupClose events.
            // 
            // I tried doing this from inside toggleStartPicker
            // and toggleEndPicker, but that doesn't react to
            // events where the user closes the datepicker by
            // clicking on some random whitespace around the
            // page (it will react correctly if you close the
            // datepicker by clicking directly on the calendar
            // button). Using a $watch statement was the only
            // way I could figure out to catch all open/close
            // events correctly.
            var watchDateOpenedVar = function(varName, which) {
                scope.$watch(varName, function(newVal, oldVal) {
                    if( newVal === oldVal ) { return; }
                    if( newVal ) { scope.onPopupOpen({ which: which }); }
                    else { scope.onPopupClose({ which: which }); }
                });
            }
            watchDateOpenedVar('model.dateOpenedStart', 'start');
            watchDateOpenedVar('model.dateOpenedEnd', 'end');

            // When the authoritative values change, update
            // all of the calculated values, and the
            // parent values.
            var onAuthoritativeChanged = function(which) {
                if( typeof which === 'undefined' ) {
                    onAuthoritativeChanged('start');
                    onAuthoritativeChanged('end');
                    return;
                }

                var authoritativeDate = scope.authoritative[which];

                // update scope.calculated.str
                scope.calculated.str[which] = momentStrict(scope.authoritative[which]).format(scope.config.timeFormat);

                // update scope.calculated.jsDateMidnightUtc
                var milliseconds = Date.UTC(
                    authoritativeDate.year,
                    authoritativeDate.month,
                    authoritativeDate.day
                );
                scope.calculated.jsDateMidnightUtc[which] = new Date(milliseconds);

                // update scope.calculated.jsDateMidnightLocal
                scope.calculated.jsDateMidnightLocal[which] = new Date(
                    authoritativeDate.year,
                    authoritativeDate.month,
                    authoritativeDate.day
                );

                // update parent date. Don't overwrite any time information
                // the parent may have left there.
                var parentDate = scope.date[which];
                if( scope.config.timezone === 'utc' ) {
                    parentDate.setUTCFullYear(authoritativeDate.year);
                    parentDate.setUTCMonth(authoritativeDate.month);
                    parentDate.setUTCDate(authoritativeDate.day);
                }
                else {
                    parentDate.setFullYear(authoritativeDate.year);
                    parentDate.setMonth(authoritativeDate.month);
                    parentDate.setDate(authoritativeDate.day);
                }
            };

            // When calculated.str changes, propagate the change
            // to the authoritative values.
            scope.onCalculatedStrChanged = function() {
                resetValidation();

                ['start','end'].forEach( function(which) {
                    var newStrVal = scope.calculated.str[which];

                    // Note: we can interpret newStrVal in any timezone
                    // we want, as long as we get the year/month/day
                    // values from the same timezone.
                    var momentLocal = moment(newStrVal, scope.config.timeFormat, true); // force strict parsing
                    if( momentLocal.isValid() ) {
                        scope.authoritative[which] = {
                            year: momentLocal.year(),
                            month: momentLocal.month(),
                            day: momentLocal.date()
                        };
                        onAuthoritativeChanged(which);
                    }
                    else {
                        var errMsg = capitalize(which) + ' time must follow the format "' + scope.config.timeFormat + '"';
                        setValidationError(which, errMsg);
                    }
                });

                performValidationChecks();
            };

            // When calculated.jsDateMidnightUtc changes, update the
            // authoritative values.
            var onCalculatedJsDateMidnightUtcChanged = function(which) {
                var newDate = scope.calculated.jsDateMidnightUtc[which];

                if( isValidDate(newDate) ) {
                    scope.authoritative[which] = {
                        year: newDate.getUTCFullYear(),
                        month: newDate.getUTCMonth(),
                        day: newDate.getUTCDate()
                    };
                    onAuthoritativeChanged(which);
                }
                else {
                    // The above should always be true: if not someone
                    // has a bug in their code (but it might not be us)
                    throw 'Error: scope.calculated.jsDateMidnightUtc was not a valid Date';
                }
            };
            scope.onCalculatedJsDateMidnightUtcStartChanged = function() {
                resetValidation();
                onCalculatedJsDateMidnightUtcChanged('start');
                performValidationChecks();
            };
            scope.onCalculatedJsDateMidnightUtcEndChanged = function() {
                resetValidation();
                onCalculatedJsDateMidnightUtcChanged('end');
                performValidationChecks();
            };

            // When calculated.jsDateMidnightLocal changes, update the
            // authoritative values.
            var onCalculatedJsDateMidnightLocalChanged = function(which) {
                var newDate = scope.calculated.jsDateMidnightLocal[which];

                if( isValidDate(newDate) ) {
                    scope.authoritative[which] = {
                        year: newDate.getFullYear(),
                        month: newDate.getMonth(),
                        day: newDate.getDate()
                    };
                    onAuthoritativeChanged(which);
                }
                else {
                    // The above should always be true: if not someone
                    // has a bug in their code (but it might not be us)
                    throw 'Error: scope.calculated.jsDateMidnightUtc was not a valid Date';
                }
            };
            scope.onCalculatedJsDateMidnightLocalStartChanged = function() {
                resetValidation();
                onCalculatedJsDateMidnightLocalChanged('start');
                performValidationChecks();
            };
            scope.onCalculatedJsDateMidnightLocalEndChanged = function() {
                resetValidation();
                onCalculatedJsDateMidnightLocalChanged('end');
                performValidationChecks();
            };

            // When the parent scope changes `scope.date`,
            // propagate the change to the authoritative
            // values.
            var onParentDateChanged = function(which) {
                if( typeof which === 'undefined' ) {
                    onParentDateChanged('start');
                    onParentDateChanged('end');
                    return;
                }

                var parentDate = scope.date[which];
                if( !isValidDate(parentDate) ) {
                    setValidationError(which, 'Error: Invalid Date passed for `scope.date.' + which + '` (' + parentDate + ')');
                }

                if( scope.config.timezone === 'local' ) {
                    scope.authoritative[which] = {
                        year: parentDate.getFullYear(),
                        month: parentDate.getMonth(),
                        day: parentDate.getDate()
                    }
                }
                else {
                    // timezone === 'utc'
                    scope.authoritative[which] = {
                        year: parentDate.getUTCFullYear(),
                        month: parentDate.getUTCMonth(),
                        day: parentDate.getUTCDate()
                    }
                }

                onAuthoritativeChanged(which);
            };
            scope.$watch('date', function() {
                if( scope.date.updateFromParent === true ) {
                    scope.date.updateFromParent = false;

                    resetValidation();
                    onParentDateChanged();
                    performValidationChecks();
                }
            }, true);

            // Not really putting these on the scope for a good
            // reason, just so that I can call them from the
            // unit tests.
            scope.testing = {
                onParentDateChanged: onParentDateChanged,
                // onCalculatedStrChanged: onCalculatedStrChanged,
                // onCalculatedJsDateMidnightUtcChanged: onCalculatedJsDateMidnightUtcChanged,
                // onCalculatedJsDateMidnightLocalChanged: onCalculatedJsDateMidnightLocalChanged
            };

            // Our starting values from the parent scope
            // are expected to live in `scope.date`. Calling
            // onParentDateChanged() will propagate both
            // values to all other values in our scope/model.
            onParentDateChanged();
            performValidationChecks();
        }
    };
}

var annotatedDirective = [].concat(dependencies);
annotatedDirective.push(datepickerDirectiveFn);

angular.module( 'laspDatePicker').directive('datepickerDate', annotatedDirective);

})();