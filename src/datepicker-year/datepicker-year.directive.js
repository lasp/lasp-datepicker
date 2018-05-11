
(function() {

var dependencies = [
    'datepickerBase',
    'timeUtils',
    'momentStrict'
];

function datepickerDirectiveFn(DatepickerBase, timeUtils, momentStrict) {
    return {
        restrict: 'E',
        templateUrl: 'datepicker-year/datepicker-year.template.html',
        scope: {
            config: '=',
            date: '='
        },
        link: function(scope, element) {
            
            var datepickerBase = new DatepickerBase(scope, element);

            angular.extend(
                scope.model,
                {
                    inputDate: {
                        start: datepickerBase.getFullYear(scope.date.start),
                        end: datepickerBase.getFullYear(scope.date.end)
                    }
                }
            );

            scope.timezone = DatepickerBase.TIMEZONES.indexOf(scope.timezone) === -1
                ? 'utc'
                : scope.timezone;

            var resetValidation = function() {
                datepickerBase.resetValidation();
            };

            var getMomentDates = function() {
                return {
                    mainStart: momentStrict(scope.date.start),
                    mainEnd: momentStrict(scope.date.end)
                };
            }

            // Note: mostly only sticking this on the scope
            // for testing purposes. You probably shouldn't
            // call it directly.
            var validateInputs = scope.validateInputs = function() {

                var momentDates = getMomentDates();

                var mainStart = momentDates.mainStart;
                var mainEnd = momentDates.mainEnd;

                var allStartsValid =
                    typeof scope.model.inputDate.start == "number" &&
                    !isNaN(scope.model.inputDate.start) &&
                    mainStart.isValid();

                var allEndsValid =
                    typeof scope.model.inputDate.end == "number" &&
                    !isNaN(scope.model.inputDate.end) &&
                    mainEnd.isValid();

                var allTimesValid = allStartsValid && allEndsValid;

                var endIsAfterStart =
                    allTimesValid &&
                    scope.model.inputDate.end > scope.model.inputDate.start &&
                    mainEnd.valueOf() > mainStart.valueOf();

                var allValid = allTimesValid && endIsAfterStart;

                resetValidation();

                if ( allValid ) {
                    return;
                }
                else if ( !allTimesValid ) {
                    var startEndTimeStr = !allStartsValid ? 'Start year' : 'End year';
                    scope.model.validationError = startEndTimeStr + ' must be a number';

                    if (!allStartsValid) {
                        scope.model.startDateStyle = DatepickerBase.STYLE_INVALID;
                    }
                    if (!allEndsValid) {
                        scope.model.endDateStyle = DatepickerBase.STYLE_INVALID;
                    }
                    return;
                }
                else if( !endIsAfterStart ) {
                    scope.model.validationError = 'Please enter a start year that falls before the end year';
                    scope.model.startDateStyle = DatepickerBase.STYLE_INVALID;
                    scope.model.endDateStyle = DatepickerBase.STYLE_INVALID;
                    return;
                }
                else {
                    throw 'Programming error: some failure case is not tested for';
                }
            };

            scope.inputDateChanged = function() {
                datepickerBase.setFullYear(
                    scope.date.start,
                    scope.model.inputDate.start
                );
                datepickerBase.setFullYear(
                    scope.date.end,
                    scope.model.inputDate.end
                );

                validateInputs();
            };

            validateInputs();
            
            // This watcher is only used to update the model when scope.date is changed outside of the datepicker directive
            scope.$watch('date', function() {
                // When scope.date is updated outside of the datepicker, we need to explicity set the flag scope.date.updateFromParent.
                // This way we won't catch extraneous changes to scope.date
                if ( scope.date.updateFromParent && scope.date.updateFromParent === true ) {
                    scope.date.updateFromParent = false;
                    scope.model.inputDate.start = datepickerBase.getFullYear( scope.date.start );
                    scope.model.inputDate.end = datepickerBase.getFullYear( scope.date.end );
                    scope.validateInputs();
                }
            }, true);
        }
    };
}

var annotatedDirective = [].concat(dependencies);
annotatedDirective.push(datepickerDirectiveFn);

angular.module( 'laspDatePicker').directive('datepickerYear', annotatedDirective);

})();