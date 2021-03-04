document.addEventListener('deviceready', onDeviceReady, false); //When device ready call onDeviceReady
document.addEventListener("DOMContentLoaded", onPageReady, false); //When page loaded call onPageReady

function onDeviceReady() { //Device ready
   console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
}

function onPageReady() { //Page ready
   document.getElementById("getPosition").addEventListener("click", getPosition); //Click button to get current position
   
   watchPosition(); //Tracks via gps 
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
