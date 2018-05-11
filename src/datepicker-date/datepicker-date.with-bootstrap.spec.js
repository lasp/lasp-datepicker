'use strict';

// There are two significant differences between this file
// and date_range_directive_tests.js (the "normal" test file):
// 
// 1. This file includes the "ui.bootstrap" module. Sometimes
//      this changes behavior in subtle ways. It is also very slow
//      to load this module for each test, so please only include
//      tests in this file if you need "ui.bootstrap".
// 2. This file provides initGlobalVariables(...) instead of
//      just doing a bunch of work in a beforeEach handler.
//      This provides more flexibility, but it also means that
//      most tests will have to remember to call it at the
//      beginning of the test.
describe( 'Directive: dateRange (with bootstrap)', function() {
    var element, $scope, $compile, isoScope, $httpBackend;

    beforeEach(angular.mock.module( 'laspDatePicker' ));
    beforeEach(angular.mock.module( 'ui.bootstrap' ));
    
    var initGlobalVariables = function(startDate, endDate, timezone) {
        return inject(function( _$rootScope_, _$compile_, _$httpBackend_ ) {
            // Setup angular scope and compiler
            $scope = _$rootScope_.$new({});
            $compile = _$compile_;
            $httpBackend = _$httpBackend_;
            
            // Setup test variables and datepicker configuration object
            $scope.date = {
                start: startDate,
                end: endDate
            };
            $scope.datePickerConfig = {
                timezone: timezone
            };

            // Create an instance of the directive
            element = angular.element( '<datepicker-date date="date" config="datePickerConfig"></datepicker-date>' );

            $compile( element )( $scope ); // Compile the directive
            $scope.$digest(); // Update the HTML
        });
    };
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it ( 'should display the correct error message when dates are backwards', function() {

        // Same as usual, but with backwards dates
        initGlobalVariables(
            new Date( '2013-08-23' ),
            new Date( '2004-11-01' ),
            'local'
        );

        var isoScope = element.isolateScope();
        expect(isoScope.model.validationError).toBe('Please enter a start time that falls before the end time');
    });

    it( 'should update the error message when the parent changes the dates', function(cb) {

        // Start with backwards dates. We'll fix them
        // after a small interval (as if by ajax) and then
        // test that the error message goes away.
        initGlobalVariables(
            new Date( '2013-08-23' ),
            new Date( '2004-11-01' ),
            'local'
        );

        var isoScope = element.isolateScope();

        // We need to use $timeout because it seems that $watch won't
        // work without it. However, $timeout in these unit tests
        // seems to require a call to $timeout.flush which, if you
        // actually want this to be async, you need to call from
        // setTimeout. So, we wrap this all up into one little
        // hackyTimeout function.
        var hackyTimeout;
        inject(function($timeout) {
            hackyTimeout = function(fn, durationMs) {
                var promise = $timeout(fn, durationMs);
                setTimeout(function() { $timeout.flush(); }, durationMs);
                return promise;
            }
        });

        hackyTimeout(
            function() {
                expect(isoScope.model.validationError).toBe('Please enter a start time that falls before the end time');

                $scope.date.start = new Date( '2004-11-01' );
                $scope.date.end = new Date( '2013-08-23' );
                $scope.date.updateFromParent = true;

                hackyTimeout(
                    function() {

                        // At time of writing validationError will be undefined, but any
                        // falsy value (null, false, '', etc) seems like it ought to be
                        // correct.
                        expect(isoScope.model.validationError).toBeFalsy();

                        cb(); // end this async unit test
                    },
                    1
                );
            },
            1
        );
    });



});
