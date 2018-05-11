"use strict";

var app = angular.module("datePickerDemoApp", ["laspDatePicker", "ui.bootstrap"]);

function today() {
	var result = new Date();
	result.setHours(0, 0, 0);
	return result;
}

function yesterday() {
	return new Date(today().getTime() - 1000*60*60*24);
}

app.controller("dateCtrl", ["$scope", function($scope) {

	$scope.date = {
		start: yesterday(),
		end: today()
	};

	$scope.datePickerConfig = {
		type: "date",
		timeFormat: "YYYY-MM-DD",
		timezone: 'local'
	};

	$scope.onPopupOpen = function( which ) {
		console.log('Opened ' + which);
	};

	$scope.onPopupClose = function( which ) {
		console.log('Closed ' + which);
	};

	$scope.onError = function( error ) {
		console.log('Validation Error ' + error );
	}
}]);

app.controller("yearCtrl", ["$scope", function($scope) {

	var endDate = today();
	var startDate = new Date(
		endDate.getFullYear()-1,
		endDate.getMonth(),
		endDate.getDate()
	);

	$scope.date = {
		start: startDate,
		end: endDate
	};

	$scope.datePickerConfig = {
		type: "year"
	};

}]);

app.controller("datetimeMinimalCtrl", ["$scope", function($scope) {

	$scope.date = {
		start: yesterday(),
		end: today()
	};

	$scope.datePickerConfig = {
		type: "datetime_minimal",
		timeFormat: "YYYY-DDDD"
	};

}]);

app.controller("durationCtrl", ["$scope", function($scope) {
    $scope.onNumberChange = function() {
        setTimeout( function() {
            console.log($scope.model);
        }, 1);

    };
    $scope.onMultiplierChange = function() {
        setTimeout( function() {
            console.log($scope.model);
        }, 1);
    };

    $scope.model = {
        duration: 1,
        durationMultiplier: '1000'
    };

}]);

app.controller("offsetCtrl", ["$scope", function($scope) {

	$scope.datePickerConfig = {
		timeFormat: 'YYYY-MM-DD',
		timezone: 'utc',
		zeroOffsetDate: today()
	};

    $scope.model = {
        scalar: 30,
        period: 'm'
    };

	$scope.now = moment.utc( today() ).format( $scope.datePickerConfig.timeFormat + 'THH:mm:ss' );

}]);