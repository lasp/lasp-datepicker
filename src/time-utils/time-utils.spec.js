
'use strict';

describe( 'Service: time-utils', function() {

    beforeEach(angular.mock.module( 'laspDatePicker' ));

    var timeUtils;
    beforeEach(function() {
        // scope hackery to get timeUtils service an then assign
        // it to a shadowed variable that is also named timeUtils.
        var tempVar;
        inject(function(timeUtils) { tempVar = timeUtils; });
        timeUtils = tempVar;
    });

    it( 'localToUtc should correctly add the local timezone offset from utc', function() {
        var MILLISECONDS_PER_MINUTE = 60 * 1000;
        var localDate = new Date();
        var utcDate = new Date ( localDate.getTime() + localDate.getTimezoneOffset() * MILLISECONDS_PER_MINUTE );
        expect( timeUtils.localToUtc( localDate ).getTime() ).toBe( utcDate.getTime() );
    });
    
    it( 'utcToLocal should correctly subtract the local timezone offset from utc', function() {
        var MILLISECONDS_PER_MINUTE = 60 * 1000;
        var localDate = new Date();
        var utcDate = new Date ( localDate.getTime() - localDate.getTimezoneOffset() * MILLISECONDS_PER_MINUTE );
        expect( timeUtils.utcToLocal( localDate ).getTime() ).toBe( utcDate.getTime() );
    });

});