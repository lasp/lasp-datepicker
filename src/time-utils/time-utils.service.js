
(function() {

'use strict';

var MILLISECONDS_PER_MINUTE = 60 * 1000;

angular.module( 'laspDatePicker' ).service(
    'timeUtils',
    [
        function() {
            return {

                /**
                * @ngdoc method
                * @name localToUtc
                * @methodOf dateRange
                * @description 
                * Adds the offset from Local time to UTC time 
                */
                localToUtc: function( date ) {
                    return new Date ( date.getTime() + date.getTimezoneOffset() * MILLISECONDS_PER_MINUTE );
                },

                /**
                * @ngdoc method
                * @name utcToLocal
                * @methodOf dateRange
                * @description 
                * Subtracts the offset from Local time to UTC time
                */
                utcToLocal: function( date ) {
                    return new Date ( date.getTime() - date.getTimezoneOffset() * MILLISECONDS_PER_MINUTE );                
                }
            }
        }
    ]
)

})();
