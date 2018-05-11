
(function() {

var dependencies = [
    'datepickerBase',
    'timeUtils',
    'momentStrict',
    '$document'
];

function datepickerDirectiveFn(DatepickerBase, timeUtils, momentStrict, $document) {
    return {
        restrict: 'E',
        templateUrl: 'datepicker-minimal/datepicker-minimal.template.html',
        scope: {
            config: '=',
            date: '='
        },
        link: function(scope, element) {
            var MILLISECONDS_PER_MINUTE = 60 * 1000;

            var datepickerBase = new DatepickerBase(scope, element);
            
            angular.extend(
                scope.model,
                {
                    durationMultiplier: String( 60 * MILLISECONDS_PER_MINUTE ), // Milliseconds in an hour, defaulting the duration to 'hours'
                    duration: 0
                }
            );

            scope.init = function() {
                scope.changeTimeZone();
                scope.getDuration();
            };

            /**
            * @ngdoc method
            * @name changeTimeZone
            * @methodOf dateRange
            * @description 
            * Changes the displayed time to either be local or utc. This function assumes the original time format was in UTC.
            * The date picker module from bootstrap will display time in local time. In order to display UTC we need to trick it by
            * adding the timezone offset to the original utc date. This needs to be removed before we send the request to LaTiS
            */
            scope.changeTimeZone = function() {
                var date = angular.copy( scope.date );
                if ( scope.config.timezone === 'local' ) {
                    date.start = timeUtils.utcToLocal( date.start );
                    date.end = timeUtils.utcToLocal( date.end );
                }
                setAllDates( date.start, date.end );
            };

            /**
            *
            * @ngdoc method
            * @name getDuration
            * @methodOf dateRange
            * @description 
            * Sets the displayed duration based on the start and end times
            */
            scope.getDuration = function() {
                // scope.durationMultiplier determines whether to format the duration in days, hours, minutes or seconds.
                // It represents milliseconds per unit.
                if ( typeof scope.date.start !== 'undefined' && typeof scope.date.end !== 'undefined' ) {
                    scope.model.duration = parseFloat((( scope.date.end.getTime() - scope.date.start.getTime() ) / Number(scope.model.durationMultiplier)).toFixed( 2 ));
                }
            };
            
            /**
            *
            * @ngdoc method
            * @name validateInput
            * @methodOf dateRange
            * @description 
            * Check that input text matches necessary criteria
            */
            scope.validateInput = function() {

                var momentDates = getMomentDates();
                // First, check that user editable dates are valid
                var mainStart = momentDates.start;
                var mainEnd = momentDates.end;
                var inputStart = momentDates.inputStart;
                var inputEnd = momentDates.inputEnd;
                var tabStart = momentDates.tabStart;
                var tabEnd = momentDates.tabEnd;
                var timepickerStart = momentDates.timepickerStart;
                var timepickerEnd = momentDates.timepickerEnd;
                
                var allStartsValid =
                    tabStart.isValid() &&
                    inputStart.isValid() &&
                    timepickerStart.isValid();

                var allEndsValid =
                    tabEnd.isValid() &&
                    inputEnd.isValid() &&
                    timepickerEnd.isValid();

                var allTimesValid = allStartsValid && allEndsValid;

                var durationIsNumber = typeof scope.model.duration === 'number';

                var endIsAfterStart = 
                    allTimesValid && // short-circuit to prevent calls to validOf from throwing
                    tabEnd.valueOf() > tabStart.valueOf() &&
                    mainEnd.valueOf() > mainStart.valueOf();

                var allValid = allTimesValid && endIsAfterStart && durationIsNumber;

                resetValidation();

                // First, check that all inputs are valid date formats
                if ( allValid ) {
                    return;
                }
                // If we get past the first if-statement something was invalid.
                // If any of the dates were invalid, print an appropriate error message with the proper formatting
                else if ( !allTimesValid ) {
                    var startEndTimeStr = !allStartsValid ? 'Start time' : 'End time';
                    scope.model.validationError = startEndTimeStr + ' must follow the format "' + scope.config.timeFormat + '"';
                    scope.disableReplot = true;

                    if (!allStartsValid) {
                        scope.model.startDateStyle = DatepickerBase.STYLE_INVALID;
                    }

                    if (!allEndsValid) {
                        scope.model.endDateStyle = DatepickerBase.STYLE_INVALID;
                    }
                    return;
                }
                // First check if the start & end dates are in order
                else if ( !endIsAfterStart ) {
                    scope.model.validationError = 'Please enter a start time that falls before the end time';
                    scope.disableReplot = true; // Disable the 'Apply' button
                    scope.model.startDateStyle = DatepickerBase.STYLE_INVALID;
                    scope.model.endDateStyle = DatepickerBase.STYLE_INVALID;
                    return;
                }
                // If the start and end date fields are valid, then a non-numeric character may have been entered in the duration field
                else if ( !durationIsNumber ) {
                    scope.model.validationError = 'Duration must be a number';
                    scope.disableReplot = true;
                    scope.model.durationStyle = DatepickerBase.STYLE_INVALID;
                    return;
                } else {
                    throw "Programming error: some failure case is not tested for";
                }
            };
            
            /**
            *
            * @ngdoc method
            * @name resetValidation
            * @methodOf dateRange
            * @description 
            * Reset error message, input field styles, and enable plot button
            */
            var resetValidation = function() {
                datepickerBase.resetValidation();
                scope.disableReplot = false;
                scope.model.durationStyle = DatepickerBase.STYLE_VALID;
            };
            
            /**
            *
            * @ngdoc method
            * @name updateTimeFormat
            * @methodOf dateRange
            * @description
            * Calls the methods to update the tabDate and inputDate. scope.config.timeFormat is a scope variable,
            * so simply calling setTabDate and setInputDate with the current date will automatically update those dates
            * with the selected time format.
            */
            scope.updateTimeFormat = function() {
                var date = scope.model.tabDate;
                setTabDate( date.start, date.end );
                setInputDate( date.start, date.end );
                scope.validateInput();
            };

            /**
            *
            * @ngdoc method
            * @name updateTimeEnd
            * @methodOf dateRange
            * @description 
            * Updates the end time based on the start time and selected duration
            */
            scope.updateTimeEnd = function() {
                var date = {
                        start : scope.date.start,
                        end : new Date( scope.date.start.getTime() + (scope.model.duration * Number(scope.model.durationMultiplier)) )
                };
                // When local time is selected, scope.date remains as UTC but the rest of the model needs to be offset
                if ( scope.config.timezone === 'local' ) {
                    date.start = timeUtils.utcToLocal( date.start );
                    date.end = timeUtils.utcToLocal( date.end );
                }
                setAllDates( date.start, date.end );
                scope.validateInput();
            };

            /**
            *
            * @ngdoc method
            * @name updateTimeStart
            * @methodOf dateRange
            * @description 
            * Updates the start time based on the end time and selected duration
            */
            scope.updateTimeStart = function() {
                var date = {
                        start : new Date( scope.date.end.getTime() - (scope.model.duration * Number(scope.model.durationMultiplier)) ),
                        end : scope.date.end
                }
                if ( scope.config.timezone === 'local' ) {
                    date.start = timeUtils.utcToLocal( date.start );
                    date.end = timeUtils.utcToLocal( date.end );
                }
                setAllDates( date.start, date.end );
                scope.validateInput();
            };
                        
            // Functions to open and close the datepickers
            scope.toggleStartPicker = function( $event ) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.model.dateOpenedStart = !scope.model.dateOpenedStart;
            };
            
            scope.toggleEndPicker = function( $event ) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.model.dateOpenedEnd = !scope.model.dateOpenedEnd;
            };
            
            // Functions to open and close advanced start and end settings
            scope.openAdvancedStart = function() {
                scope.model.showAdvancedStart = true;
                scope.model.showAdvancedEnd = false;
            };
            
            scope.openAdvancedEnd = function() {
                scope.model.showAdvancedStart = false;
                scope.model.showAdvancedEnd = true;
            };
            
            scope.closeAdvancedSettings = function() {
                scope.model.showAdvancedStart = false;
                scope.model.showAdvancedEnd = false;
            };
            
            // This watcher is only used to update the model when scope.date is changed outside of the datepicker directive
            scope.$watch('date', function() {
                // When scope.date is updated outside of the datepicker, we need to explicity set the flag scope.date.updateFromParent.
                // This way we won't catch extraneous changes to scope.date
                if ( scope.date.updateFromParent && scope.date.updateFromParent === true ) {
                    scope.date.updateFromParent = false;
                    var date = scope.date;
                    scope.config.timezone = 'utc';
                    setAllDates( date.start, date.end );

                    // Update duration and validationError values
                    scope.getDuration();
                    scope.validateInput();
                }
            }, true);
            
            // In order to check whether the user clicked in the datepicker or outside of it, 
            // we need to get the parent elements of the relatedTarget (the element that was clicked).
            // If one of the parent elements contains the datepicker, then we know we should not close the settings.
            // Given an element, this will return all parents/grandparents/etc as an array of HtmlElement
            var getParents = function(el) {
                var result = [];
                if (el) {
                    var currentParent = el.parentElement;
                    while (currentParent) {
                        result.push(currentParent);
                        currentParent = currentParent.parentElement;
                    }
                }
                return result;
            }
            
            // Since we've refactored each datepicker style to be its own directive,
            // we know that the element we want will simply be the first child of our
            // <datepicker-minimal> element (there may also be some other elements afterwards).
            // There used to be much more complicated logic here.
            var allDatepickerElements = element.children();
            var datepickerElement = allDatepickerElements[0];

            // This code is our solution to closing the advanced settings box for the datepicker_minimal view
            // when the datepicker loses focus. We originally tried using Angular's ngBlur directive to catch when 
            // the advanced settings would lose focus. This sort of worked, but because there are so many different elements 
            // in the advanced settings box, clicking certain elements or the white space within the box would 
            // trigger a blur event and close the box.
            if ( datepickerElement !== null && typeof datepickerElement !== 'undefined' ) {
                // This solution involves listening for a blur event in the datepicker.
                datepickerElement.addEventListener('blur', function( e ) {
                    // First, we check where the user clicked. For a blur event, the relatedTarget is the element receiving focus.
                    // Note, blur events in Firefox do not support relatedTarget, so we include _.explicitOriginalTarget as a workaround
                    var relatedTarget = e.relatedTarget ||          // for proper browsers
                                        e.explicitOriginalTarget || // for firefox
                                        document.activeElement;     // for IE 9-11
                    
                    // If the relatedTarget is null or is document.body, the user did not click in the datepicker and we should close
                    var hasActiveElement = !(relatedTarget == null || relatedTarget == document.body);
                    
                    // If hasActiveElement is true, the body was not clicked. Check the parent elements of 
                    // the element that was clicked, and see if they contain the datepicker. If indexOf returns > -1,
                    // one of the parent elements contains the datepicker and we should not close the settings.
                    var activeElementIsChild = hasActiveElement && getParents(relatedTarget).indexOf(this) > -1;
                    if ( !hasActiveElement || !activeElementIsChild ) {
                        // wait for mouseup or keyup to close the advanced settings panel
                        $document.on( 'mouseup', closeOnce );
                        $document.on( 'keyup', closeOnce );
                    } else {
                        return;
                    }
                }, true);
            }
            
            function closeOnce() {
                scope.closeAdvancedSettings();
                scope.$apply();
                $document.off( 'mouseup', closeOnce );
                $document.off( 'keyup', closeOnce );
            }
            
            scope.model.validationError = undefined;
            scope.model.startDateStyle = DatepickerBase.STYLE_VALID;
            scope.model.endDateStyle = DatepickerBase.STYLE_VALID;
            scope.model.showAdvancedStart = false;
            scope.model.showAdvancedEnd = false;
            
            // Maintain time format strings here. Note that the ordinal format has 4 D's as this is required in the format for moment.js 
            var isoStandardFormat = 'YYYY-MM-DD';
            var isoOrdinalFormat = 'YYYY-DDDD';
            
            /* Default time format is passed as 'YYYY-MM-DD' or 'YYYY-DDDD' when instantiating directive.
             * Double check that format is one of the two values that we'd expect, or use the ISO standard
             * format.
             */
            scope.config.timeFormat = (DatepickerBase.TIME_FORMATS.indexOf(scope.config.timeFormat) === -1)
                ? DatepickerBase.ISO_STANDARD_FORMAT
                : scope.config.timeFormat;
            scope.config.timezone = ( scope.config.timezone === 'utc' || scope.config.timezone === 'local') ? 
                                        scope.config.timezone : 'utc';
            
            scope.model.inputDate = {};
            scope.model.tabDate = {};
            scope.model.timepicker = {};
            
            /**
            * @ngdoc method
            * @name getMomentDates
            * @methodOf dateRange
            * @description 
            * Return Moment.JS date objects
            */
            var getMomentDates = function() {
                return {
                  start: momentStrict( scope.date.start ),
                  end: momentStrict( scope.date.end ),
                  inputStart: momentStrict( scope.model.inputDate.start ),
                  inputEnd: momentStrict( scope.model.inputDate.end ),
                  tabStart: momentStrict( scope.model.tabDate.start ),
                  tabEnd: momentStrict( scope.model.tabDate.end ),
                  timepickerStart: momentStrict( scope.model.timepicker.start ),
                  timepickerEnd: momentStrict( scope.model.timepicker.end )
                };
            };
            
            /**
            * @ngdoc method
            * @name setMainDate
            * @methodOf dateRange
            * @description 
            * Method to set the primary date object, scope.date. If local time is selected,
            * this method will also offset scope.date so that it always remains in UTC time.
            * @param {object} start Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new start date
            * @param {object} end Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new end date
            */
            var setMainDate = function( start, end ) {
                scope.date.start = momentStrict.utc( start ).toDate();
                scope.date.end = momentStrict.utc( end ).toDate();
                if ( scope.config.timezone === 'local' ) {
                    scope.date.start = timeUtils.localToUtc( scope.date.start );
                    scope.date.end = timeUtils.localToUtc( scope.date.end );
                }
            };

            /**
            * @ngdoc method
            * @name setTabDate
            * @methodOf dateRange
            * @description 
            * Method to set the date object which displays the full ISO 8601 string in the datepicker.
            * @param {object} start Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new start date
            * @param {object} end Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new end date
            */
            var setTabDate = function( start, end ) {
                scope.model.tabDate.start = momentStrict.utc( start ).format( scope.config.timeFormat + 'THH:mm:ss' );
                scope.model.tabDate.end = momentStrict.utc( end ).format( scope.config.timeFormat + 'THH:mm:ss' );
            };
            
            /**
            * @ngdoc method
            * @name setInputDate
            * @methodOf dateRange
            * @description 
            * Method to set the date object which displays the truncated ISO 8601 string, showing only the date, not time.
            * @param {object} start Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new start date
            * @param {object} end Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new end date
            */
            var setInputDate = function( start, end ) {
                scope.model.inputDate.start = momentStrict.utc( start ).format( scope.config.timeFormat );
                scope.model.inputDate.end = momentStrict.utc( end ).format( scope.config.timeFormat );
            };
            
            /**
            * @ngdoc method
            * @name setTimepickerDate
            * @methodOf dateRange
            * @description 
            * Method to set the date object used by the Bootstrap timepicker. Even if the timepicker is
            * passed a UTC date, it always defaults to displaying local time. As a result, in this method
            * we always have to offset the timepicker so it will display the desired date.
            * @param {object} start Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new start date
            * @param {object} end Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new end date
            */
            var setTimepickerDate = function( start, end ) {
                // In case these aren't passed as native date objects, which is required to calculate the offset
                var start = momentStrict.utc( start ).toDate();
                var end = momentStrict.utc( end ).toDate();
                scope.model.timepicker.start = timeUtils.localToUtc( start );
                scope.model.timepicker.end = timeUtils.localToUtc( end );
            };
            
            /**
            * @ngdoc method
            * @name setAllDates
            * @methodOf dateRange
            * @description 
            * Method to call all setter methods for the date model
            * @param {object} start Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new start date
            * @param {object} end Native JS Date object, Moment.JS date object, or ISO 8601 string to set as new end date
            */
            var setAllDates = function( start, end ) {
                if ( momentStrict( start ).isValid() && momentStrict( end ).isValid() ) {
                    setMainDate( start, end );
                    setTabDate( start, end );
                    setInputDate( start, end );
                    setTimepickerDate( start, end );
                }
            };
            
            /**
             * @ngdoc method
             * @name mainDateChanged
             * @methodOf dateRange
             * @description 
             * Method called by ng-change on calendar widget in datepicker.
             * This will update the tabDate, inputDate, and timepickerDate
             */
            scope.mainDateChanged = function() {
                var date = angular.copy( scope.date );
                if( momentStrict( date.start ).isValid() && momentStrict( date.end ).isValid() ) {
                    if ( scope.config.timezone === 'local' ) {
                        date.start = timeUtils.utcToLocal( date.start );
                        date.end = timeUtils.utcToLocal( date.end );
                    }
                    setTabDate( date.start, date.end );
                    setInputDate( date.start, date.end );
                    setTimepickerDate( date.start, date.end );
                }
                scope.getDuration();
                scope.validateInput();
            };
            
            /**
             * @ngdoc method
             * @name tabStartDateChanged
             * @methodOf dateRange
             * @description
             * Method called when start date is change. Will be passed
             * the new (text) value for the start date
             */
            scope.tabStartDateChanged = function(newValue) {
                scope.tabDateChanged(newValue, scope.model.tabDate.end);
            };
            
            /**
             * @ngdoc method
             * @name tabEndDateChanged
             * @methodOf dateRange
             * @description
             * Method called when end date is change. Will be passed
             * the new (text) value for the end date
             */
            scope.tabEndDateChanged = function(newValue) {
                scope.tabDateChanged(scope.model.tabDate.start, newValue);
            };

            /**
             * @ngdoc method
             * @name tabDateChanged
             * @methodOf dateRange
             * @description 
             * Helper method that contains most of the logic to handle
             * changes to either the start or end date. Used by
             * tabStartDateChange and tabEndDateChanged.
             */
            scope.tabDateChanged = function(start, end) {
                if( momentStrict( start ).isValid() && momentStrict( end ).isValid() ) {
                    setMainDate( start, end );
                    setInputDate( start, end );
                    setTimepickerDate( start, end );
                }

                // These need to be set even if they're invalid so
                // that validateInput fails correctly.
                scope.model.tabDate.start = start;
                scope.model.tabDate.end = end;

                scope.getDuration();
                scope.validateInput();
            };
            
            /**
             * @ngdoc method
             * @name inputDateChanged
             * @methodOf dateRange
             * @description 
             * Method called by ng-change on datepicker input field containing truncated ISO 8601 string
             * This will update the mainDate, tabDate, and timepickerDate
             */
            scope.inputDateChanged = function() {
                var inputDate = angular.copy( scope.model.inputDate );
                var mainDate = angular.copy( scope.date );
                var date = {};
                date.start = momentStrict({ 
                    years: momentStrict( inputDate.start ).year(), 
                    months: momentStrict( inputDate.start ).month(), 
                    days: momentStrict( inputDate.start ).date(), 
                    hours: momentStrict( mainDate.start ).hour(), 
                    minutes: momentStrict( mainDate.start ).minute(), 
                    seconds: momentStrict( mainDate.start ).second(), 
                    milliseconds: 0 
                    }).toDate();
                date.end = momentStrict({ 
                    years: momentStrict( inputDate.end ).year(), 
                    months: momentStrict( inputDate.end ).month(), 
                    days: momentStrict( inputDate.end ).date(), 
                    hours: momentStrict( mainDate.end ).hour(), 
                    minutes: momentStrict( mainDate.end ).minute(), 
                    seconds: momentStrict( mainDate.end ).second(), 
                    milliseconds: 0 
                    }).toDate();
                if( momentStrict( date.start ).isValid() && momentStrict( date.end ).isValid() ) {
                    setMainDate( date.start, date.end );
                    setTabDate( date.start, date.end );
                    setTimepickerDate( date.start, date.end );
                }
                scope.getDuration();
                scope.validateInput();
            }
            
            /**
             * @ngdoc method
             * @name timepickerDateChanged
             * @methodOf dateRange
             * @description 
             * Method called by ng-change on Bootstrap timepicker in datepicker
             * This will update the mainDate, tabDate, and inputDate
             */
            scope.timepickerDateChanged = function() {
                var date = angular.copy( scope.model.timepicker );
                if ( momentStrict( date.start ).isValid() && momentStrict( date.end ).isValid() ) {
                    date.start = timeUtils.utcToLocal( date.start );
                    date.end = timeUtils.utcToLocal( date.end );
                }
                setMainDate( date.start, date.end );
                setTabDate( date.start, date.end );
                setInputDate( date.start, date.end );
                scope.getDuration();
                scope.validateInput();
            };
            
            /**
             * @ngdoc method
             * @name initViewDates
             * @methodOf dateRange
             * @description 
             * Set initial values for tabDate, inputDate, timepickerDate, and duration given scope.date
             */
            scope.initViewDates = function() {
                // Set Moment.JS date objects to a single local object for easier management
                var momentDates = getMomentDates();
                setInputDate( scope.date.start, scope.date.end );
                setTabDate( scope.date.start, scope.date.end );
                setTimepickerDate( scope.date.start, scope.date.end );
                scope.getDuration();
                scope.validateInput()
            }
            scope.initViewDates();

            scope.init();
        }
    };
}

var annotatedDirective = [].concat(dependencies);
annotatedDirective.push(datepickerDirectiveFn);

angular.module( 'laspDatePicker').directive('datepickerMinimal', annotatedDirective);

})();