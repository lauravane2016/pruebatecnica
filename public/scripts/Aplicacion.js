
var app = angular.module("prueba", ["ngFileUpload"]);
app.controller('controladorPrueba', function($scope,$http) {
	$scope.files = [];
	
	// Get all the files when enter to the page
	$http.get("/getFiles")
		.success(function(data){
			$scope.files = data;
		})
		.error(function(err){
			console.log(err);
		});
});
