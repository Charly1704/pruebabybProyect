bybApp = angular.module("bybApp",[]);
bybApp.controller("backlogCtrl",function($scope,$http,$location,$window){

    $scope.historias = [];
    $scope.releaseBacklog =[];
    $scope.userHistory = {};
    $scope.habilidades = [];
    $scope.haySprint = true;
    $scope.datosSprint={};
    $scope.sprint = {};
    //Conexion a socket normal
    //$scope.socket = io.connect("http://",{'forceNew':true},{secure:true});

    //Conexion a socket segura
    $scope.socket = io.connect("https://",{'forceNew':true},{secure:true});


$scope.getUserHistory = function(id){
    $scope.idProy = id;
    console.log("Se ejecuto la funcion");
    console.log("El Id es"+id);
    $http.get("/api/backlog/" + $scope.idProy).success(function(data){
        console.log(data);
        $scope.historias = data;
        console.log($scope.userHistorys);
        }).error(function(err){
            console.log(String(err))
        })
    $http.get("/api/sprints/"+$scope.idProy).success(function(data) {
        $scope.sprint = data;
    }).error(function(err) {
        console.log(String(err))
    })
    };
$scope.showEditbacklog = function(id){
    console.log(id);
    $scope.historyToEdit = $scope.historias[id]
    console.log($scope.historyToEdit);
};

$scope.editbacklog = function(){
    $http.post("/api/editbacklog",$scope.historyToEdit).success(function(data){
        console.log(data)
        $scope.socket.emit("editBacklog",$scope.historyToEdit);
    }).error(function(err){
        console.log(String(err))
    });
};

$scope.saveUserHistory = function(id){
    console.log("posteando...");
    console.log("El id al hacer el post es: ",id)
    $scope.userHistory.proyectos = id;
    console.log($scope.userHistory);
    $http.post("/api/backlog/"+id,$scope.userHistory).success(function(data){
    console.log(data);
    $scope.socket.emit("mensajeNuevo",data);
    }).error(function(err){
    console.log(String(err));
    })
    }
$scope.historyToRelease = function(id){
    $http.post("/api/userHistoryState/"+id).success(function(data) {
        console.log(data);
        $scope.socket.emit("backlogAccepted",data)
    }).error(function(err) {
        console.log(String(err));
    })
}
$scope.historyToSprint = function(item){
    console.log($scope.sprint.idSprint);
    console.log(item);
    var tamanioTotal = 0;
    for( var val in $scope.sprint.backlog){
        tamanioTotal+=$scope.sprint.backlog[val].tamanio;
    }
    console.log(tamanioTotal);
    console.log($scope.sprint.tamanioSprint);
    console.log(item.tamanio);
    if(($scope.sprint.tamanioSprint-tamanioTotal)>=item.tamanio){
        $http.post("/api/historyToSprint/"+$scope.sprint.idSprint,item).success(function(data) {
        console.log(data);
       // $scope.sprint = data;
        console.log($scope.sprint);
       $scope.socket.emit("newSprint",data);
    }).error(function(err) {
        console.log(String(err));
    })
    }else{
        $window.alert("No es posible agregar la tarjeta se ha excedido el tamaño del Sprint");
    }
    
}
$scope.addSkill = function(){
         $scope.habilidades.push({habilidad:$scope.skills.habilidad,grado:$scope.skills.grado});
         console.log($scope.habilidades);
         $scope.skills.habilidad = '';
         $scope.skills.grado = '';
     }
     $scope.saveSkills = function(){
         var newSkills = {
             habilidades:$scope.habilidades
         }
         if($scope.habilidades.length>0){
            $http({
                url:"/api/saveSkills",
                method:'POST',
                data:$scope.habilidades
            }).success(function(data) {
                console.log(data);
            }).error(function(err) {
                console.log(String(err));
            })    
         }
     }
     $scope.crearSprint = function(idProy){
         $http.post("/api/crearSprint/"+idProy,$scope.datosSprint).success(function(data) {
             console.log(data);
             $scope.haySprint = false;
             //$scope.sprint = data;
             $scope.socket.emit("newSprint",data);
         }).error(function(err) {
             console.log(String(err));
         })
     }
$scope.haySprints =function(){
    console.log($scope.sprint == {});
    var contador=0;
    for(var item in $scope.sprint){
        console.log($scope.sprint.hasOwnProperty(item))
        if($scope.sprint.hasOwnProperty(item)){
            contador++;
        }
    }
    console.log(contador==0);
    //if($scope.sprint =={})
}();
     $scope.socket.on("enviarMensajes",function(data){
            $scope.historias = data;
            console.log($scope.historias);
            $scope.$apply();
     });
     $scope.socket.on("agregarRelease",function(data) {
         console.log($scope.releaseBacklog);
         $scope.releaseBacklog = data;
         console.log(data);
         $scope.$apply();
     });
     $scope.socket.on("agregarSprint",function(data){
         console.log(data);
         $scope.sprint = data;
         var contador=0;
    for(var item in $scope.sprint){
        console.log($scope.sprint.hasOwnProperty(item))
        if($scope.sprint.hasOwnProperty(item)){
            contador++;
        }
    }
    if(contador!=0){
        $scope.haySprint = false;
    }
    console.log(contador==0);
         $scope.$apply();
     })
})
