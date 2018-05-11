
(function() {

function durationDirectiveFn() {
    return {
        restrict: 'E',
        templateUrl: 'datepicker-duration/datepicker-duration.template.html',
        scope: {
            label: '@',
            relativeTo: '@',
            relativeSymbol: '@',
            onNumberChange: '=',
            onMultiplierChange: '=',
            style: '=',
            model: '='
        },
        link: function(scope, element) {
            
        }
    };
}

angular.module( 'laspDatePicker').directive('datepickerDuration', durationDirectiveFn);

})();