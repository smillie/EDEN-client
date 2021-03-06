'use strict';


function posAdjust(XorY,item){
  var canvasparent = $('#gamecanvas').parent();
  var w = canvasparent.innerWidth();
  var h = canvasparent.innerHeight();
  if(XorY === 'x'){
    var canv = canvasparent.offset().left;

  } else {
    var canv = canvasparent.offset().top;
  }
  item - canv;

  var pushGrid = (XorY === 'x') ? -260 : -40;

  
  
  // stage dimensions
  var ow = 1280; // your stage width
  var oh = 800; // your stage height

   // keep aspect ratio
   var scale = Math.min(w / ow, h / oh);

  var position = (item*1/scale)+pushGrid; 
  return position-(position%20); 
}
// Stolen so we dont have to care about the canvas
function onResize(stage)
{
var keepAspectRatio = true;
// browser viewport size
var canvasparent = $('#gamecanvas').parent();
var w = canvasparent.innerWidth();
var h = canvasparent.innerHeight();


// stage dimensions
var ow = 1280; // your stage width
var oh = 800; // your stage height

if (keepAspectRatio)
{
    // keep aspect ratio
    var scale = Math.min(w / ow, h / oh);
    stage.scaleX = scale;
    stage.scaleY = scale;

   // adjust canvas size
   stage.canvas.width = ow * scale;
  stage.canvas.height = oh * scale;
}
else
{
    // scale to exact fit
    stage.scaleX = w / ow;
    stage.scaleY = h / oh;

    // adjust canvas size
    stage.canvas.width = ow * stage.scaleX;
    stage.canvas.height = oh * stage.scaleY;
   }

 // update the stage
stage.update()
}



angular.module('edenClientApp')
  .controller('MainCtrl', function ($scope, objectService, componentService, urlHelper) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var spaceQuake = false;

    // Main Game controller
    var stage = new createjs.Stage("gamecanvas");
    var circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 40);
    //Set position of Shape instance.
    circle.x = circle.y = 50;
    //Add Shape instance to stage display list.

    var ground = objectService.getGround();
    var base = objectService.getGardenBase();
    var panel = objectService.getPerson();
    var greenhouse = objectService.getAwesomeGreenhouse();
    greenhouse.x += 220;
    greenhouse.y += 20;

    var panels = [];
    stage.addChild(ground);
    stage.addChild(base);
    stage.addChild(greenhouse)
    console.log($scope);
    for (var i = 0; i < (urlHelper.getURLParameters("peoplecount") !== undefined ? parseInt(urlHelper.getURLParameters("peoplecount")) : 7); i++) {
      var panel = objectService.getPerson();
      panels.push(panel);
      stage.addChild(panel);
      panel.rotation=360*Math.random();
      panel.x += Math.random()*800;
      panel.y += Math.random()*800;
    };

    $scope.availableComponents = [];
    $scope.availableEnvironments = [];
    
    componentService.getEnvironments(function(envs){
      $scope.availableEnvironments = envs;
      $scope.simulationState.environmentName = $scope.availableEnvironments[0];
    });
      
    
    $scope.simulationState = {}
    
    $scope.simulationState.colony = {};
    $scope.colony = $scope.simulationState.colony;
    $scope.simulationState.colony.name = "Simulation name";
    $scope.simulationState.colony.components = [];
      
    componentService.getComponents(function(comps){
      $scope.availableComponents = comps;
    });
      
    $scope.addComponent = function (id,posx,posy) {
      console.log(id);
        $scope.simulationState.colony.components.push($scope.availableComponents[id]);
        var greenhouse;
        switch(id)
        {
          case "0":
            greenhouse = objectService.getBalloonGreenhouse();
            break;
          case "2":
            greenhouse = objectService.getFlatPackGreenhouse();
            break;
          case "3":
            greenhouse = objectService.getAwesomeGreenhouse();
            break;
          default:
            greenhouse = objectService.getBalloonGreenhouse();
        }
        
        greenhouse.x = posAdjust("x",posx);
        greenhouse.y = posAdjust("y",posy);
        stage.addChild(greenhouse);
        
    }

    
    setInterval(function () {
        console.log($scope.simulationState);
        componentService.updateSimulation($scope.simulationState, function (newSimState) {
            $scope.simulationState = newSimState;
        });
    }, 6000);
      
      
    $scope.simulationState.resources = {};
    $scope.simulationState.resources.resourceMap = {};
    $scope.resources = $scope.simulationState.resources.resourceMap;
      
    componentService.getResourceNames(function (resources) {
       for (var i = 0; i < resources.length; i++) {
           var resource = resources[i];
           $scope.resources.resource = {"count": 100};
       }
    });
    

    //Update stage will render next frame
    stage.update();

    window.onresize = function()
	{
	     onResize(stage);
	}
	window.onresize();

  
  
  var step = 0;
	setInterval(function(){
    for (var i = 0; i < panels.length; i++) {
     var panel = panels[i]
      panel.x+=2*Math.cos((panel.rotation+90)*0.0174532925);
      panel.y+=2*Math.sin((panel.rotation+90)*0.0174532925);
      step++;
      if(panel.x > 1300 || panel.x < -20 || panel.y > 820 || panel.y < -20){
        panel.rotation += 180;
      }
      panel.rotation+=Math.random()*4-2;
    };
    if (spaceQuake){
      stage.x =Math.sin(panel.rotation)*10;
      stage.y =Math.sin(panel.rotation)*10;
    }
    if (step % 1000 == 0){

    }

		stage.update();
	},33);

  }).directive('draggable', function() {
    return function($scope, element) {
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
            'dragstart',
            function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData("id",this.id);
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function(e) {
                this.classList.remove('drag');
                return false;
            },
            false
        );
    }
}).directive('droppable', function() {
    return {
        scope: {
            drop: '&',
            bin:  '='
        },
        link: function($scope, element) {
            var el = element[0];
            
            el.addEventListener(
                'dragover',
                function(e) {
                    e.dataTransfer.dropEffect = 'move';
                    if (e.preventDefault) e.preventDefault();
                    this.classList.add('over');
                    return false;
                },
                false
            );
            
            el.addEventListener(
                'dragenter',
                function(e) {
                    this.classList.add('over');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragleave',
                function(e) {
                    this.classList.remove('over');
                    return false;
                },
                false
            );
            
            el.addEventListener(
                'drop',
                function(e) {
                    if (e.stopPropagation) e.stopPropagation();
                    this.classList.remove('over');
                    var test = e.dataTransfer.getData("id");
                    $scope.$apply(function($scope) {
                        var fn = $scope.drop();
                        if ('undefined' !== typeof fn) {
                          var dropx = e.x;
                          var dropy = e.y;
                          fn(e.dataTransfer.getData("id"),dropx,dropy);
   
                        }
                    });
                },
                false
            );
        }
    }
});
