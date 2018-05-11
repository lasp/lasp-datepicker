'use strict';

describe('Directive: datepicker-date', function() {
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
            timezone: 'utc'
        };

        // Create an instance of the directive
        element = angular.element( '<datepicker-date date="date" config="datePickerConfig"></datepicker-date>' );

        $compile( element )( $scope ); // Compile the directive
        $scope.$digest(); // Update the HTML
    }));
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    it( 'isolated scope should be defined', function() {
        expect( element.isolateScope() ).toBeDefined;
    });

    it( 'onParentDateChanged should correctly update date model when scope.date changes', function() {
        isoScope = element.isolateScope();
        // Set new date for testing
        isoScope.date = {
            start: new Date( '2015-04-27T07:30:00.000Z' ),
            end: new Date( '2015-04-28T10:30:00.000Z' )
        };
        // Call onParentDateChanged
        isoScope.testing.onParentDateChanged();
        
        // Check calculated.str
        expect( isoScope.calculated.str.start ).toBe( '2015-04-27' );
        expect( isoScope.calculated.str.end ).toBe( '2015-04-28' );
    });
    
    it( 'onCalculatedStrChanged should correctly update date model when scope.calculated.str changes', function() {
        isoScope = element.isolateScope();
        // Set new dates for testing
        isoScope.date = {
            start: new Date( '2015-04-20T12:30:00.000Z'),
            end: new Date( '2015-04-22T16:30:00.000Z'),
        };
        isoScope.calculated.str = {
            start: '2015-04-11',
            end: '2015-04-12'
        };
        // Call updateDateModel
        isoScope.onCalculatedStrChanged();
        
        // We're going to check *everything* this time. Future tests will
        // be lazier.

        // Ensure no error message
        expect( isoScope.model.validationError ).toBeFalsy();

        // Check authoritative dates
        expect( isoScope.authoritative.start ).toEqual({
            year: 2015,
            month: 3,
            day: 11
        });
        expect( isoScope.authoritative.end ).toEqual({
            year: 2015,
            month: 3,
            day: 12
        });

        // Check jsDateMidnightUtc
        expect( isoScope.calculated.jsDateMidnightUtc.start ).toEqual( new Date( Date.UTC( 2015, 3, 11 ) ) );
        expect( isoScope.calculated.jsDateMidnightUtc.end ).toEqual( new Date( Date.UTC( 2015, 3, 12 ) ) );

        // Check jsDateMidnightLocal
        expect( isoScope.calculated.jsDateMidnightLocal.start ).toEqual( new Date( 2015, 3, 11 ) );
        expect( isoScope.calculated.jsDateMidnightLocal.end ).toEqual( new Date( 2015, 3, 12 ) );

        // Check date. This is the most importent check in this unit test because it's the piece
        // that the user will actually see and interact with.
        expect( isoScope.date.start ).toEqual( new Date( Date.UTC(2015, 3, 11, 12, 30, 0)) );
        expect( isoScope.date.end ).toEqual( new Date( Date.UTC(2015, 3, 12, 16, 30, 0)) );
    });
    
    it( 'should catch improperly formatted user input', function() {
        isoScope = element.isolateScope();
        isoScope.model.inputDate = {
            start: '2013-01-01',
            end: '2014-01-01',
        };

        // Initially, there should be no error
        isoScope.onCalculatedStrChanged();
        expect( isoScope.model.validationError ).toBeFalsy();
        
        // Try changing start date to fall after end date
        isoScope.calculated.str.start = '2015-01-01';
        isoScope.onCalculatedStrChanged();
        expect( isoScope.model.validationError ).toBe( 'Please enter a start time that falls before the end time' );

        isoScope.calculated.str.start = 'this clearly is not a date string';
        isoScope.onCalculatedStrChanged();
        expect( isoScope.model.validationError ).toBe( 'Start time must follow the format \"YYYY-MM-DD\"' );

        isoScope.config.timeFormat = 'YYYY-DDDD';
        isoScope.onCalculatedStrChanged();
        expect( isoScope.model.validationError ).toBe( 'Start time must follow the format \"YYYY-DDDD\"' );
    });

    it( 'should display the correct error message while the inputDate is being modified', function() {
        var isoScope = element.isolateScope();

        var copyOfStartDate = new Date(isoScope.date.start.getTime());

        // Value as though we're partway through editing. Most browsers will
        // incorrectly 'succeed' at parsing this particular value even though we'd like
        // it to be parsed to 'Invalid Date'. This causes a lot of subtle
        // issues in our code.
        isoScope.calculated.str.start = '2003-02';
        isoScope.onCalculatedStrChanged();

        expect( isoScope.date.start ).toEqual( copyOfStartDate ); // should be unchanged due to format error
        expect( isoScope.model.validationError ).toBe( 'Start time must follow the format \"YYYY-MM-DD\"' );
    });

});