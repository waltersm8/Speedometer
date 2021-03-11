const apiKey = "AIzaSyCbArt4f2VQXDDfHho_TQbFlUMi9qURx9I";

document.addEventListener('deviceready', onDeviceReady, false); //When device ready call onDeviceReady
//document.addEventListener("DOMContentLoaded", onPageReady, false); //When page loaded call onPageReady

document.getElementById('settingsIcon').addEventListener('click', openSettings);
document.getElementById('closeSettings').addEventListener('click', closeSettings);

var storage = window.localStorage;

currentSpeed = null;
currentSpeedLimit = null;

function loadSettings() {
    console.log('test');
    if (storage.getItem('initialized') == 'true') {
        console.log('Get values and put as placeholders');
        phoneNumber = storage.getItem('phoneNumber');
        warningOver = storage.getItem('warningOver');
        dangerOver = storage.getItem('dangerOver');
        timeSpeeding = storage.getItem('timeSpeeding');
    
        $('#phoneNumber').attr('placeholder', phoneNumber);
        $('#warningOver').attr('placeholder', warningOver);
        $('#dangerOver').attr('placeholder', dangerOver);
        $('#timeSpeeding').attr('placeholder', timeSpeeding);
    } else {
        storage.setItem('phoneNumber', '');
        storage.setItem('warningOver', '5');
        storage.setItem('dangerOver', '15');
        storage.setItem('timeSpeeding', '30');
        storage.setItem('initialized', 'true');
        console.log('Initialized Values');
    }
}

function setSettings() {
    phoneNumber = $('#phoneNumber').val();
    warningOver = $('#warningOver').val();
    dangerOver = $('#dangerOver').val();
    timeSpeeding = $('#timeSpeeding').val();

    if(phoneNumber) {
        storage.setItem('phoneNumber', phoneNumber);
        console.log('Set Phone Number')
    }
    if(warningOver) {
        storage.setItem('warningOver', warningOver);
        console.log('Set Warning Over')
    }
    if(dangerOver) {
        storage.setItem('dangerOver', dangerOver);
        console.log('Set Danger Over');
    }
    if(timeSpeeding) {
        storage.setItem('timeSpeeding', timeSpeeding);
        console.log('Set Time Speeding');
    }
}

function openSettings() {
    loadSettings();
    document.getElementById('settings').style.display = "block";
}

function closeSettings() {
    setSettings();
    document.getElementById('settings').style.display = "none";
}

function onDeviceReady() { //Device ready
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    smsController.requestSMSPermission();

    $(document).ready(function () {

        onPageReady();
  });
}

var smsController = {
    checkSMSPermission: () => {
        var success = (hasPermission) => {
            if(hasPermission) {
                console.log("App has SMS permission")
            }
            else {
                alert("This app will not function properly without the ability to send SMS.\nPlease provide permission.");
            }
        };
        var error = (error) => {
            alert("Something went wrong: " + error);
        }
        sms.hasPermission(success, error);
    },

    requestSMSPermission: function() {
        var success = function(hasPermission) {
            if(!hasPermission) {
                sms.requestPermission(function() {
                    console.log("Permission accepted");
                }, function(error) {
                    alert("This app will not function properly without the ability to send SMS.\nPlease provide permission.");
                    console.log(error);
                });
            }
        };
        var error = function(error) {
            alert("Something went wrong: " + error);
        }
        sms.hasPermission(success, error);
    },

    sendSMS: (number, message) => {
        var options = {
            replaceLineBreaks: true,
            android: {
                intent: ""
            }
        };

        var success = () => {
            console.log("Message sent successfully");
        }

        var failure = (error) => {
            console.error("Message failed: " + error);
        }

        sms.send(number, message, options, success, failure);
    }
}

function onPageReady() { //Page ready
   watchPosition(); //Tracks via gps
}

var timeSpeeding = 0;
var warnings = 0;
var resetThreshHold = 0;

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

         if (speedDiff > parseInt(storage.getItem('dangerOver'))) {
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
                  smsController.sendSMS(storage.getItem('phoneNumber'), 'I\'m speeding, ground me when I get home.');
                  $('#contactNotified').toggle();
                  warnings++;
               } else {
                  //alert('Contact notified');
               }
            }

         } else if (speedDiff > parseInt(storage.getItem('warningOver'))) {
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
                  smsController.sendSMS(storage.getItem('phoneNumber'), 'I\'m speeding, ground me when I get home.');
                  $('#contactNotified').toggle();
                  warnings++;
               } else {
                  //alert('Contact notified');
               }
            }

         } else {
            //green stuff
            $('#speedometer').removeClass('redGlow yellowGlow').addClass('greenGlow');
            $('#speedLimit').removeClass('redText yellowText').addClass('greenText');

            resetThreshHold ++;

            if (resetThreshHold > 5) {
               timeSpeeding = 0;
               resetThreshHold = 0;
            }

            //alert('time reset');
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
