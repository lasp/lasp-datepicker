
(function() {

var dependencies = [
    'datepickerBase',
    'timeUtils',
    'momentStrict',
    '$document'
];


function offsetDirectiveFn(DatepickerBase, timeUtils, momentStrict, $document) {
    return {
        restrict: 'E',
        templateUrl: 'datepicker-offset/datepicker-offset.template.html',
        scope: {
            config: '=',          // includes .timezone, .timeFormat, and .zeroOffsetDate
            model: '='            // includes .scalar and .period
        },
        link: function(scope, element) {
            
            // datepickerBase overrides scope.model, so give it its own "scope"
            scope.baseScope = {};
            var datepickerBase = new DatepickerBase(scope.baseScope, element);
            
            scope.vm = {
                absolute: 0,
                scalar: 0,
                period: 's'
            };

            // default model: 0 seconds.
            scope.model.scalar = scope.model.scalar || 0;
            scope.model.period = scope.model.period || 's';
            
            /* Default time format is passed as 'YYYY-MM-DD' or 'YYYY-DDDD' when instantiating directive.
             * Double check that format is one of the two values that we'd expect, or use the ISO standard
             * format.
             */
            scope.config.timeFormat = (DatepickerBase.TIME_FORMATS.indexOf(scope.config.timeFormat) === -1)
                ? DatepickerBase.ISO_STANDARD_FORMAT
                : scope.config.timeFormat;
            scope.config.timezone = ( scope.config.timezone === 'utc' || scope.config.timezone === 'local') ? 
                                        scope.config.timezone : 'utc';
            

            
            scope.updateAbsoluteFromRelative = function() {
                if ( scope.vm.scalar === null ) {
                    return;
                }
                // set the absolute input field based on the zeroOffsetDate + relative duration
                var msDuration = moment.duration( scope.vm.scalar, scope.vm.period ).asMilliseconds();
                var displayDate = momentStrict.utc( scope.config.zeroOffsetDate ).add( msDuration, 'ms' );
                if ( scope.config.timezone === 'local' ) {
                    // convert the utc time to a local datestring
                    displayDate = momentStrict.utc( timeUtils.utcToLocal( displayDate.toDate() ) );
                }
                scope.vm.absolute = displayDate.format( scope.config.timeFormat + 'THH:mm:ss' );
                validate();

                updateModelFromInputs();
            };

            scope.updateRelativeFromAbsolute = function() {
                if ( !validate() ) {
                    return;
                }
                // set the relative duration fields based on absolute date - zeroOffsetDate
                var displayDate = momentStrict.utc( scope.vm.absolute ).toDate();
                if ( scope.config.timezone === 'local' ) {
                    // convert a datestring in a local tz to a utc date.
                    displayDate = timeUtils.localToUtc( displayDate );
                }
                var zeroDate = momentStrict.utc( scope.config.zeroOffsetDate );

                var diffMs = ( displayDate.getTime() - zeroDate.toDate().getTime() );
                // Find the most friendly period to use.
                // Only use a certain period if the scalar would be >= 3
                // i.e. a period of 2 hours would actually display as 120 minutes,
                // but 3 hours would display as 3 hours
                var duration = moment.duration( diffMs, 'ms' );
                if ( Math.abs(duration.asYears()) >= 3 ) {
                    scope.vm.scalar = duration.asYears();
                    scope.vm.period = 'y';
                } else if ( Math.abs(duration.asDays()) >= 3 ) {
                    scope.vm.scalar = duration.asDays();
                    scope.vm.period = 'd';
                } else if ( Math.abs(duration.asHours()) >= 3 ) {
                    scope.vm.scalar = duration.asHours();
                    scope.vm.period = 'h';
                } else if ( Math.abs(duration.asMinutes()) >= 3 ) {
                    scope.vm.scalar = duration.asMinutes();
                    scope.vm.period = 'm';
                } else {
                    scope.vm.scalar = duration.asSeconds();
                    scope.vm.period = 's';
                }

                updateModelFromInputs();
            };

            // when the model or zero-offset-date changes, update the displayed values
            scope.$watchGroup( ['model.scalar', 'model.period', 'config.zeroOffsetDate'], function(newVals, oldVals) {
                if ( newVals[0] === undefined || angular.equals(newVals, oldVals) ) return;
                updateInputsFromModel();
            }, true );

            function updateInputsFromModel() {
                // make the input elements reflect the values in scope.model
                scope.vm.scalar = scope.model.scalar;
                scope.vm.period = scope.model.period;

                scope.updateAbsoluteFromRelative();
            }

            function updateModelFromInputs() {
                // make scope.model reflect the values in the input elements
                var newModel = {
                    scalar: scope.vm.scalar,
                    period: scope.vm.period
                };
                if ( angular.equals(scope.model, newModel) ) {
                    return;
                }
                if ( newModel.scalar !== null ) {
                    scope.model.scalar = newModel.scalar;
                }
                scope.model.period = newModel.period;
            }

            function validate() {
                if ( !momentStrict( scope.vm.absolute ).isValid() ) {
                    scope.baseScope.model.validationError = 'Absolute start time must follow the format "' + scope.config.timeFormat + 'THH:mm:ss' + '"';
                    scope.inputStyle = DatepickerBase.STYLE_INVALID;
                    return false;
                }
                resetValidation();
                return true;
            }

            function resetValidation() {
                datepickerBase.resetValidation();
                scope.inputStyle = DatepickerBase.STYLE_VALID;
            }

            resetValidation();
            updateInputsFromModel();
            
        }
    };
}

var annotatedDirective = [].concat(dependencies);
annotatedDirective.push(offsetDirectiveFn);

angular.module( 'laspDatePicker').directive('datepickerOffset', annotatedDirective);

})();