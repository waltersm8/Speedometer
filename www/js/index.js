const apiKey = "AIzaSyAyliqD6cYu1MmSduqEcYXHqYUD5OUqRBw";

document.addEventListener('deviceready', onDeviceReady, false); //When device ready call onDeviceReady
document.addEventListener("DOMContentLoaded", onPageReady, false); //When page loaded call onPageReady

function onDeviceReady() { //Device ready
   console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
}

function onPageReady() { //Page ready
   document.getElementById("getPosition").addEventListener("click", getSpeedLimit); //Click button to get current position

   //watchPosition(); //Tracks via gps
}

function getPosition() { //This is more of a debugging function to run when get position button is clicked
    var options = {
       enableHighAccuracy: true,
       maximumAge: 3600000
    }
    var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    function onSuccess(position) {
       alert(
            'Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
    };

    function onError(error) {
      alert('Oopsies the app developers suck \n\n The app should still run just fine we promise \n\n code: '    + error.code    + '\n' +'message: ' + error.message + '\n');
   }
 }

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
      };


    function onError(error) {
       alert('Oopsies the app developers suck \n\n The app should still run just fine we promise \n\n code: '    + error.code    + '\n' +'message: ' + error.message + '\n');
    }
 }

//Get the speed limit to insert into a thing. Returns either the speed limit or null.
function getSpeedLimit() {
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
            console.log(data);
            if(data.snappedPoints.length > 0) {
                snappedLocation = data.snappedPoints[0].placeId;
                let speedLimit = $.ajax({
                     url: "https://roads.googleapis.com/v1/speedLimits",
                     async: true,
                     method: "get",
                     data: {
                         placeId: location,
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

 }
