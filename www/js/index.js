const apiKey = "AIzaSyCbArt4f2VQXDDfHho_TQbFlUMi9qURx9I";

document.addEventListener('deviceready', onDeviceReady, false); //When device ready call onDeviceReady
//document.addEventListener("DOMContentLoaded", onPageReady, false); //When page loaded call onPageReady

document.getElementById('settingsIcon').addEventListener('click', openSettings);
document.getElementById('closeSettings').addEventListener('click', closeSettings);

currentSpeed = null;
currentSpeedLimit = null;

function openSettings() {
   document.getElementById('settings').style.display = "block";
}

function closeSettings() {
   document.getElementById('settings').style.display = "none";
}

function onDeviceReady() { //Device ready
   console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
   $(document).ready(function () {
      onPageReady();
   })
}

function onPageReady() { //Page ready
   watchPosition(); //Tracks via gps
}

var timeSpeeding = 0;
warnings = 0;

 function watchPosition() {
    var options = {
       maximumAge: 3600000,
       timeout: 200,
       enableHighAccuracy: true,
    }
    var watchID = navigator.geolocation.watchPosition(onSuccess, onError, options); //Gets the data

    function onSuccess(position) { //When data get is successfull
         var speedDisplay = document.getElementById('currentSpeed'); //Get current speed element

         speed = position.coords.speed;
         speed = speed.toString();

         speedDisplay.innerHTML = speed.split('.')[0]; //Set current speed on the app

         currentSpeed = parseInt(speed.split('.')[0]);
         currentSpeedLimit = getSpeedLimit();

         $('#speedLimitValue').html(currentSpeedLimit);

         speedDiff = currentSpeed - currentSpeedLimit;

         if (speedDiff > 15) {
            //red stuff
            $('#speedometer').removeClass('greenGlow yellowGlow').addClass('redGlow');
            $('#speedLimit').removeClass('greenText yellowText').addClass('redText');

            timeSpeeding += 200;

            if (timeSpeeding > 3000) {
               timeSpeeding = 0;

               if (warnings == 0) {
                  $('#warning1').removeClass('greenGlow');
                  $('#warning1').addClass('redGlow');
                  warnings++;
               } else if (warnings == 1) {
                  $('#warning2').removeClass('greenGlow');
                  $('#warning2').addClass('redGlow');
                  warnings++;
               } else if (warnings == 2) {
                  $('#warning3').removeClass('greenGlow');
                  $('#warning3').addClass('redGlow');
                  warnings++;
               } else {
                  alert('Contact notified');
               }
            }

         } else if (speedDiff > 5) {
            //yellow stuff
            $('#speedometer').removeClass('greenGlow redGlow').addClass('yellowGlow');
            $('#speedLimit').removeClass('greenText redText').addClass('yellowText');

            timeSpeeding += 200;

            if (timeSpeeding > 3000) {
               timeSpeeding = 0;

               if (warnings == 0) {
                  $('#warning1').removeClass('greenGlow');
                  $('#warning1').addClass('yellowGlow');
                  warnings++;
               } else if (warnings == 1) {
                  $('#warning2').removeClass('greenGlow');
                  $('#warning2').addClass('yellowGlow');
                  warnings++;
               } else if (warnings == 2) {
                  $('#warning3').removeClass('greenGlow');
                  $('#warning3').addClass('yellowGlow');
                  warnings++;
               } else {
                  alert('Contact notified');
               }
            }

         } else {
            //green stuff
            $('#speedometer').removeClass('redGlow yellowGlow').addClass('greenGlow');
            $('#speedLimit').removeClass('redText yellowText').addClass('greenText');

            timeSpeeding = 0;

            alert('time reset');

         }
      };
      function onError(error) {
         alert('Oopsies the app developers suck \n\n The app should still run just fine we promise \n\n code: '    + error.code    + '\n' +'message: ' + error.message + '\n');
      }
 }

//Get the speed limit to insert into a thing. Returns either the speed limit or null.
function getSpeedLimit() {
    return 45;
    /*
    var options = {
        enableHighAccuracy: true,
        maximumAge: 3600000
    }

    var data = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    function onSuccess(position) {
        let location = position.coords.latitude + "," + position.coords.longitude + "|" +  position.coords.latitude + "," + position.coords.longitude;
        let roads = $.ajax({
             url: "https://roads.googleapis.com/v1/snapToRoads",
             async: true,
             method: "get",
             data: {
                 path: location,
                 key: apiKey
             }
        })
        .done((data) => {
            console.log(data.snappedPoints);
            if(data.snappedPoints.length > 0) {
                snappedLocation = data.snappedPoints[0].placeId;
                let speedLimit = $.ajax({
                     url: "https://roads.googleapis.com/v1/speedLimits",
                     async: true,
                     method: "get",
                     dataType: 'json',
                     contentType: 'json',
                     data: {
                         placeId: snappedLocation,
                         key: apiKey
                     }
                 })
                 .then((data) => {
                     console.log(data);
                     alert("Success");
                 })
                 .fail((error) => {
                     console.log(error);
                     alert("Failure");
                 });

            }
        })
        .fail((error) => {
            console.error(error);
            alert("Error: " + error);
            return null;
        });
    }

    function onError(error) {
        console.error(error);
        alert("Uh oh: " + error);
        return null;
    }
    */
 }
