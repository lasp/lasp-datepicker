
(function() {

angular.module( 'laspDatePicker' ).directive(
    'dateInput',
    [
        function( ) {
            return {
                restrict: "E",
                templateUrl: 'datepicker-minimal/date-input.template.html',
                scope: {
                    title: "@",
                    model: "=",
                    style: "=",
                    onFocus: "&",
                    onChange: "&"
                }
            }
        }
    ]
);

})();
