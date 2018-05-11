'use strict';

describe( 'Directive: dateRange', function() {
    var element, $scope, $compile, isoScope, $httpBackend;

    beforeEach(angular.mock.module( 'laspDatePicker' ));
    
    beforeEach(inject(function( _$rootScope_, _$compile_, _$httpBackend_ ) {
        // Setup angular scope and compiler
        $scope = _$rootScope_.$new({});
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        
        // Setup test variables and datepicker configuration object
        $scope.date = {
            start: new Date( '2013-11-10T07:30:00.000Z' ),
            end: new Date( '2013-11-12T10:30:00.000Z' )
        };
        $scope.datePickerConfig = {
        };

        // Create an instance of the directive
        element = angular.element( '<datepicker-minimal date="date" config="datePickerConfig"></datepicker-minimal>' );

        $compile( element )( $scope ); // Compile the directive
        $scope.$digest(); // Update the HTML
    }));
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    var subtractOffsetMs = function ( date ) {
        var offsetMs = date.getTimezoneOffset() * 60 * 1000;
        return date.getTime() - offsetMs;
    };

    it( 'isolated scope should be defined', function() {
        expect( element.isolateScope() ).toBeDefined;
    });
    
    it( 'should correctly initialize date model', function() {
        isoScope = element.isolateScope(); // This allows us to access the directive scope
        // First check the time format
        expect( isoScope.config.timeFormat ).toBe( 'YYYY-MM-DD' );
        
        // Call initViewDates
        isoScope.initViewDates();
        
        // Next, check inputDate
        expect( moment(isoScope.model.inputDate.start).valueOf() ).toBe( moment('2013-11-10').valueOf() );
        expect( moment(isoScope.model.inputDate.end).valueOf() ).toBe( moment('2013-11-12').valueOf() );
        // Check tabDate
        expect( moment(isoScope.model.tabDate.start).valueOf() ).toBe( moment('2013-11-10T07:30:00').valueOf() );
        expect( moment(isoScope.model.tabDate.end).valueOf() ).toBe( moment('2013-11-12T10:30:00').valueOf() ); 
        // Check timepicker
        expect( isoScope.model.timepicker.start.getTime() ).toBe( moment('2013-11-10T07:30:00').valueOf() );
        expect( isoScope.model.timepicker.end.getTime() ).toBe( moment('2013-11-12T10:30:00').valueOf() );
    });

    it( 'mainDateChanged should correctly update date model when scope.date changes', function() {
        isoScope = element.isolateScope();
        // Set new date for testing
        isoScope.date = {
            start: new Date( '2015-04-27T07:30:00.000Z' ),
            end: new Date( '2015-04-28T10:30:00.000Z' )
        };
        // Call updateDateModel
        isoScope.mainDateChanged();
        
        // Check inputDate
        expect( moment(isoScope.model.inputDate.start).valueOf() ).toBe( moment('2015-04-27').valueOf() );
        expect( moment(isoScope.model.inputDate.end).valueOf() ).toBe( moment('2015-04-28').valueOf() );
        // Check tabDate
        expect( moment(isoScope.model.tabDate.start).valueOf() ).toBe( moment('2015-04-27T07:30:00').valueOf() );
        expect( moment(isoScope.model.tabDate.end).valueOf() ).toBe( moment('2015-04-28T10:30:00').valueOf() );
        // Check timepicker
        expect( isoScope.model.timepicker.start.getTime() ).toBe( moment('2015-04-27T07:30:00').valueOf() );
        expect( isoScope.model.timepicker.end.getTime() ).toBe( moment('2015-04-28T10:30:00').valueOf() );
    });
    
    it( 'inputDateChanged should correctly update date model when scope.inputDate changes', function() {
        isoScope = element.isolateScope();
        // Set new dates for testing
        isoScope.date = {
            start: new Date( '2015-04-20T12:30:00.000Z'),
            end: new Date( '2015-04-22T16:30:00.000Z'),
        }
        isoScope.model.inputDate = {
            start: '2015-04-11',
            end: '2015-04-12'
        };
        // Call updateDateModel
        isoScope.inputDateChanged();
        
        // Check scope.date
        expect( moment(isoScope.date.start).valueOf() ).toBe( moment('2015-04-11T12:30:00.000Z').valueOf() );
        expect( moment(isoScope.date.end).valueOf() ).toBe( moment('2015-04-12T16:30:00.000Z').valueOf() );
        // Check tabDate
        expect( moment(isoScope.model.tabDate.start).valueOf() ).toBe( moment('2015-04-11T12:30:00').valueOf() );
        expect( moment(isoScope.model.tabDate.end).valueOf() ).toBe( moment('2015-04-12T16:30:00').valueOf() );
        // Check timepicker
        expect( isoScope.model.timepicker.start.getTime() ).toBe( moment('2015-04-11T12:30:00').valueOf() );
        expect( isoScope.model.timepicker.end.getTime() ).toBe( moment('2015-04-12T16:30:00').valueOf() );
    });
    
    it( 'tabDateChanged should correctly update date model when scope.model.tabDate changes', function() {
        isoScope = element.isolateScope();
        // Set new date for testing
        isoScope.model.tabDate = {
            start: '2015-04-29T14:30:00',
            end:  '2015-04-30T23:59:00'
        };
        // Call methods to update tabDate
        isoScope.tabStartDateChanged( isoScope.model.tabDate.start );
        isoScope.tabEndDateChanged( isoScope.model.tabDate.end );
        // Check scope.date
        expect( moment.utc(isoScope.date.start).valueOf() ).toBe( moment.utc('2015-04-29T14:30:00').valueOf() );
        expect( moment.utc(isoScope.date.end).valueOf() ).toBe( moment.utc('2015-04-30T23:59:00').valueOf() );
        // Check inputDate
        expect( moment.utc(isoScope.model.inputDate.start).valueOf() ).toBe( moment.utc('2015-04-29').valueOf() );
        expect( moment.utc(isoScope.model.inputDate.end).valueOf() ).toBe( moment.utc('2015-04-30').valueOf() );

        // Check timepicker, which will always be set forward by the timezone offset. Our offset is currently 6 hours
        expect( moment.utc(isoScope.model.timepicker.start).valueOf() ).toBe( moment(isoScope.model.tabDate.start).valueOf() );
        expect( moment.utc(isoScope.model.timepicker.end).valueOf() ).toBe( moment(isoScope.model.tabDate.end).valueOf() );
    });
    
    it( 'timepickerDateChanged should correctly update date model when scope.model.timepicker changes', function() {
        isoScope = element.isolateScope();
        // Set new date for testing
        isoScope.model.timepicker = {
            start: moment.utc('2015-08-01T12:30:00').toDate(),
            end:  moment.utc('2015-08-13T20:00:00').toDate()
        };
        isoScope.timepickerDateChanged();

        expect( moment.utc(isoScope.date.start).valueOf() ).toBe( subtractOffsetMs( isoScope.model.timepicker.start ) );
        expect( moment.utc(isoScope.date.end).valueOf() ).toBe( subtractOffsetMs( isoScope.model.timepicker.end ) );
        // Check inputDate
        expect( moment.utc(isoScope.model.inputDate.start).valueOf() ).toBe( moment.utc('2015-08-01T00:00:00').valueOf() );
        expect( moment.utc(isoScope.model.inputDate.end).valueOf() ).toBe( moment.utc('2015-08-13T00:00:00').valueOf() );
        // Check tabDate
        expect( moment(isoScope.model.tabDate.start).valueOf() ).toBe( isoScope.model.timepicker.start.getTime() );
        expect( moment(isoScope.model.tabDate.end).valueOf() ).toBe( isoScope.model.timepicker.end.getTime() );
    });
    
    
    
    /**
     * Something important about this directive: The bootstrap timepicker directive
     * assumes time since epoch GMT but shows local time. When we want to show
     * local time we give it the exact local string, but when we want to show UTC we
     * need to add the timezone offset to the string and the time picker will subtract
     * it out when we display it. This means that we need to make sure to subtract our local
     * timezone offset whenever we are in UTC mode before we give the date to latis.
     * For the purpose of these tests, we are assuming a 6 hour timezone offset (MDT)
     */
    
    it( 'should adjust correctly to the timezone', function() {
        isoScope = element.isolateScope();

        isoScope.date = {
            start: new Date( '2015-04-20T04:30:00.000Z' ),
            end: new Date( '2015-04-22T10:30:00.000Z' ),
        };
        isoScope.model.tabDate = {
            start: '2015-04-20T04:30:00',
            end:  '2015-04-22T10:30:00'
        };

        // Save off some values from the 'original' utc mode
        isoScope.config.timezone = 'utc';
        isoScope.changeTimeZone();
        var timepickerOriginal = {
            start: moment(isoScope.model.timepicker.start).valueOf(),
            end: moment(isoScope.model.timepicker.end).valueOf()
        };

        // To begin the tests, set timezone to local
        isoScope.config.timezone = 'local';
        isoScope.changeTimeZone();

        // The main date should remain the same
        expect( moment.utc( isoScope.date.start ).valueOf() ).toBe( moment.utc( '2015-04-20T04:30:00.000Z' ).valueOf() );
        expect( moment.utc( isoScope.date.end ).valueOf() ).toBe( moment.utc( '2015-04-22T10:30:00.000Z' ).valueOf() );
        // The tab date should be offset. Here, the offset is currently -6 hours
        expect( moment.utc( isoScope.model.tabDate.start ).valueOf() ).toBe( subtractOffsetMs( isoScope.date.start ) );
        expect( moment.utc( isoScope.model.tabDate.end ).valueOf() ).toBe( subtractOffsetMs( isoScope.date.end ) );
        // The input date should be offset.
        function dayOnly(date) {
            var copy = new Date(date.getTime());
            copy.setHours(0, 0, 0, 0);
            return copy;
        }
        expect( moment.utc( isoScope.model.inputDate.start ).valueOf() ).toBe( subtractOffsetMs( dayOnly(isoScope.date.start) ) );
        expect( moment.utc( isoScope.model.inputDate.end ).valueOf() ).toBe( subtractOffsetMs( dayOnly(isoScope.date.end) ) );
        // The timepicker date should be offset.
        expect( moment.utc( isoScope.model.timepicker.start ).valueOf() ).toBe( moment.utc( '2015-04-20T04:30:00.000Z' ).valueOf() );
        expect( moment.utc( isoScope.model.timepicker.end ).valueOf() ).toBe( moment.utc( '2015-04-22T10:30:00.000Z' ).valueOf() );
        
        // Now change the timezone back to UTC
        isoScope.config.timezone = 'utc';
        isoScope.changeTimeZone();
        // The main date should remain the same
        expect( moment.utc( isoScope.date.start ).valueOf() ).toBe( moment.utc( '2015-04-20T04:30:00.000Z' ).valueOf() );
        expect( moment.utc( isoScope.date.end ).valueOf() ).toBe( moment.utc( '2015-04-22T10:30:00.000Z' ).valueOf() );
        // Tab date
        expect( moment.utc( isoScope.model.tabDate.start ).toISOString() ).toBe( moment.utc( '2015-04-20T04:30:00' ).toISOString() );
        expect( moment.utc( isoScope.model.tabDate.end ).toISOString() ).toBe( moment.utc( '2015-04-22T10:30:00' ).toISOString() );
        // Input date
        expect( moment.utc( isoScope.model.inputDate.start ).toISOString() ).toBe( moment.utc( '2015-04-20' ).toISOString() );
        expect( moment.utc( isoScope.model.inputDate.end ).toISOString() ).toBe( moment.utc( '2015-04-22' ).toISOString() );
        // Timepicker date
        expect( moment.utc( isoScope.model.timepicker.start ).toISOString() ).toBe( moment( timepickerOriginal.start ).toISOString() );
        expect( moment.utc( isoScope.model.timepicker.end ).toISOString() ).toBe( moment( timepickerOriginal.end ).toISOString() );
    });
    
    it( 'should add time to the end date when the duration is increased', function() {
        isoScope = element.isolateScope();
        // The duration initially defaults to hours, so we should expect to offset the date by 3 hours
        isoScope.model.duration = 3;
        // Set new dates for testing
        isoScope.date = {
            start: new Date( '2015-04-20T12:30:00.000Z'),
            end: new Date( '2015-04-22T16:30:00.000Z'),
        }
        isoScope.updateTimeEnd();
        
        // The end time should be 3 hours after the start time, given the default value for scope.model.durationMultiplier
        expect( moment.utc( isoScope.date.start ).valueOf() ).toBe( moment.utc( '2015-04-20T12:30:00.000Z' ).valueOf() );
        expect( moment.utc( isoScope.date.end ).valueOf() ).toBe( moment.utc( '2015-04-20T15:30:00.000Z' ).valueOf() );
    });
    
    it( 'should add time to the start date when the duration is increased', function() {
        isoScope = element.isolateScope();
        // The duration initially defaults to hours, so we should expect to offset the date by 3 hours
        isoScope.model.duration = 3;
        // Set new dates for testing
        isoScope.date = {
            start: new Date( '2015-04-25T10:30:00.000Z'),
            end: new Date( '2015-04-27T18:30:00.000Z'),
        }
        isoScope.updateTimeStart();
        
        // The start time should be 3 hours before the end time, given the default value for scope.model.durationMultiplier
        expect( moment.utc( isoScope.date.start ).valueOf() ).toBe( moment.utc( '2015-04-27T15:30:00.000Z' ).valueOf() );
        expect( moment.utc( isoScope.date.end ).valueOf() ).toBe( moment.utc( '2015-04-27T18:30:00.000Z' ).valueOf() );
    });
    
    it( 'should calculate the duration between two dates', function() {
        isoScope = element.isolateScope();
        isoScope.date = {
            start: new Date( '2014-03-20T10:30:00.000Z'),
            end: new Date( '2015-03-20T10:30:00.000Z'),
        }
        isoScope.getDuration();
        // The default value for isoScope.model.durationMultiplier is 3600000, which is the number of ms in one hour
        // Therefore, the duration returned will be the number of hours in one year.
        expect( isoScope.model.duration ).toBe( 8760 );
        // If we change the multiplier to the number of ms in one day, the duration returned will be the number of days in one year.
        isoScope.model.durationMultiplier = 86400000;
        isoScope.getDuration();
        expect( isoScope.model.duration ).toBe( 365 );
    });
    
    it( 'validateInput should catch improperly formatted user input', function() {
        isoScope = element.isolateScope();
        isoScope.model.tabDate = {
            start: '2013-01-01T00:00:00.000Z',
            end: '2014-01-01T00:00:00.000Z',
        };
        
        // Initially, there should be no error
        isoScope.validateInput();
        expect( isoScope.model.validationError ).toBe( undefined );
        
        // Try changing start date to fall after end date
        isoScope.model.tabDate.start = '2015-01-01T00:00:00.000Z';
        isoScope.updateTimeFormat();
        isoScope.validateInput();
        
        expect( isoScope.model.validationError ).toBe( 'Please enter a start time that falls before the end time' );
        // Try entering non-numeric characters to input fields
        isoScope.model.tabDate.start = 'this clearly is not a date string';
        isoScope.validateInput();
        expect( isoScope.model.validationError ).toBe( 'Start time must follow the format \"YYYY-MM-DD\"' );
        // Try the non-numeric characters again, but now with a different time format
        isoScope.config.timeFormat = 'YYYY-DDDD';
        isoScope.validateInput();
        expect( isoScope.model.validationError ).toBe( 'Start time must follow the format \"YYYY-DDDD\"' );

        // Reset input field
        isoScope.model.tabDate = {
            start: '2013-01-01T00:00:00.000Z',
            end: '2014-01-01T00:00:00.000Z',
        };

        // Enter non-numeric character into duration input field
        isoScope.model.duration = 'This should probably be a number';
        isoScope.validateInput();
        expect( isoScope.model.validationError ).toBe( 'Duration must be a number' );

        // If we leave this value as a non-number, we'll get an error in our tests
        // because this value is the model for an <input type="number" />, and angular
        // will kindly remind us that a string is not a valid value for that type
        // of input.
        isoScope.model.duration = 10;
    });

});
