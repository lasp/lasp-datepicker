'use strict';

describe('Directive: datepicker-year', function() {
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
        element = angular.element( '<datepicker-year date="date" config="datePickerConfig"></datepicker-year>' );

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
    
    it( 'inputDateChanged should correctly update date model when scope.inputDate changes', function() {
        isoScope = element.isolateScope();
        // Set new dates for testing
        isoScope.date = {
            start: new Date( '2014-04-20T12:30:00.000Z'),
            end: new Date( '2015-04-22T16:30:00.000Z')
        }
        isoScope.model.inputDate = {
            start: 1990,
            end: 2000
        };
        // Call updateDateModel
        isoScope.inputDateChanged();
        
        // Check scope.date
        // Year should have changed, but month/time/etc should not have
        expect( isoScope.date.start ).toEqual( new Date( '1990-04-20T12:30:00.000Z') );
        expect( isoScope.date.end ).toEqual( new Date( '2000-04-22T16:30:00.000Z') );
    });
    
    it( 'validateInputs should catch improperly formatted user input', function() {
        isoScope = element.isolateScope();
        isoScope.model.inputDate = {
            start: 2013,
            end: 2014,
        };
        
        // Initially, there should be no error
        isoScope.validateInputs();
        expect( isoScope.model.validationError ).toBe( undefined );
        
        // Try changing start date to fall after end date
        isoScope.model.inputDate.start = 2015;
        isoScope.validateInputs();
        
        expect( isoScope.model.validationError ).toBe( 'Please enter a start year that falls before the end year' );
        // Try entering non-numeric characters to input fields
        var nonNumericValues = [ null, undefined, false, parseFloat('NaN') ];
        nonNumericValues.forEach(function( val ) {
            isoScope.model.inputDate.start = val;
            isoScope.validateInputs();
            expect( isoScope.model.validationError ).toBe( 'Start year must be a number' );
        });

        isoScope.model.inputDate.start = 2013;
        isoScope.validateInputs();
        expect( isoScope.model.validationError ).toBeFalsy();
    });

    it( 'should interpret parent dates correctly', function() {
        var midnightUtc = new Date(Date.UTC(2015, 0, 1, 0, 0, 0, 0));

        var isoScope = element.isolateScope();

        isoScope.timezone = 'utc';
        isoScope.date.end = midnightUtc;
        isoScope.date.updateFromParent = true;
        isoScope.$digest();
        expect( isoScope.model.inputDate.end ).toEqual( 2015 );

        // This second test checks that the 'local' timezone works the way
        // we expect. In this case, that means that when we set the date
        // to midnight 01/01 UTC the 'local' year should be one less than
        // the UTC year because it's 12/31 of the previous year. However,
        // this test brings with it the assumption that the 'local' timezone
        // is not UTC, and that it is offset from UTC in the negative direction
        // (e.g. MST == UTC - 7hrs)
        // 
        // Note: being offset from UTC in the negative direction will cause
        // getTimezoneOffset to yield a positive number. Don't ask me why.
        // 
        // If the 'local' timezone is UTC, then there isn't really a good
        // test we can run here. This happens a lot if the tests are being
        // run on a server somewhere (e.g. our Jenkins server). We could
        // make an analogous test for timezones with a positive UTC offset,
        // but that doesn't seem likely to happen at this office.
        // 
        // Conclusion: if this test can't really be run correctly, don't run
        // it.
        if( isoScope.date.end.getTimezoneOffset() > 0 ) {
            isoScope.timezone = 'local';
            isoScope.date.end.setHours(0, 0, 0, 1); // Add 1ms to trigger watch handler
            isoScope.date.updateFromParent = true;
            isoScope.$digest();
            expect( isoScope.model.inputDate.end ).toEqual( 2014 );
        }
        
    });

});