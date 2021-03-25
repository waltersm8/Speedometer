document.addEventListener('deviceready', onDeviceReady, false); //When device ready call onDeviceReady

document.getElementById('settingsIcon').addEventListener('click', openPin);
document.getElementById('closeSettings').addEventListener('click', closeSettings);
document.getElementById('closePin').addEventListener('click', closeSettings);

var storage = window.localStorage;

document.addEventListener("pause", () => {
    smsController.sendSMS(storage.getItem('phoneNumber'), "ALERT: Speedometer is no longer tracking my speed.")
})

document.addEventListener("resume", () => {
    smsController.sendSMS(storage.getItem('phoneNumber'), "ALERT: Speedometer has resumed tracking my speed.");
});

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
        userPin = storage.getItem('userPin');

        $('#phoneNumber').attr('placeholder', phoneNumber);
        $('#warningOver').attr('placeholder', warningOver);
        $('#dangerOver').attr('placeholder', dangerOver);
        $('#timeSpeeding').attr('placeholder', timeSpeeding);
        $('#setNewPin').attr('placeholder', userPin);
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
    let didSettingsChange = false;
    const oldContactNumber = storage.getItem("phoneNumber");

    phoneNumber = $('#phoneNumber').val();
    warningOver = $('#warningOver').val();
    dangerOver = $('#dangerOver').val();
    timeSpeeding = $('#timeSpeeding').val();
    newPin = $('#setNewPin').val();

    if(phoneNumber) {
        didSettingsChange = true;
        storage.setItem('phoneNumber', phoneNumber);
        console.log('Set Phone Number')
    }
    if(warningOver) {
        didSettingsChange = true;
        storage.setItem('warningOver', warningOver);
        console.log('Set Warning Over')
    }
    if(dangerOver) {
        didSettingsChange = true;
        storage.setItem('dangerOver', dangerOver);
        console.log('Set Danger Over');
    }
    if(timeSpeeding) {
        didSettingsChange = true;
        storage.setItem('timeSpeeding', timeSpeeding);
        console.log('Set Time Speeding');
    }
    if(newPin) {
        didSettingsChange = true;
        storage.setItem('userPin', newPin);
        console.log('Set New PIN');
    }

    if(didSettingsChange) {
        smsController.sendSMS(oldContactNumber, "ALERT: My Speedometer settings have been changed.")
    }
}

function openPin() {
    loadSettings();
    $('#passcode').fadeIn();
    document.getElementById('enteredPin').focus();

    $('#enteredPin').val('');

    if(storage.userPin) {
        $('#pinHeader').html('Input User PIN');
        $('#setPinBtn').css('display', 'none');
    } else {
        $('#pinHeader').html('Set A PIN')
        $('#setPinBtn').css('display', 'block');
    }
}

function setPin() {
    storage.userPin = $('#enteredPin').val();
    alert('User PIN has been set to: ' + storage.userPin);
    loadSettings();
    openSettings();
}

function checkPin() {
    enteredPin = $('#enteredPin').val();
    if (enteredPin == storage.userPin) {
        openSettings();
        $('#enteredPin').val('');
    }

}

function openSettings() {
    document.getElementById('enteredPin').blur();
    $('#settings').fadeIn();
}

function closeSettings() {
    setSettings();
    $('#settings').fadeOut();
    $('#passcode').fadeOut();
}

function onDeviceReady() { //Device ready
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    smsController.requestSMSPermission();

    $(document).ready(function () {
        smsController.sendSMS(localStorage.getItem("phoneNumber"), "ALERT: I'm going on a drive.");
        onPageReady();
  });
}

var vibrationController = {
    warning: () => {
        navigator.notification.beep(1);
        navigator.vibrate(1000);
        console.log("Warning!")
    },

    danger: () => {
        navigator.notification.beep(2);
        navigator.vibrate([1000, 100, 1000, 100, 1000, 100, 1000]);
        console.log("Danger!");
    },

    contactAlerted: () => {
        navigator.notification.beep(3);
        navigator.vibrate([250, 100, 250, 100, 1000]);
        console.log("Contact Alerted!");
    }
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
                  smsController.sendSMS(storage.getItem('phoneNumber'), 'RED ALERT: I\'m going ' + currentSpeed + 'mph in a ' + currentSpeedLimit + 'mph zone.');
                  $('#contactNotified').toggle();
                  warnings++;
                  vibrationController.contactAlerted();
               }

               vibrationController.danger();
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
                  smsController.sendSMS(storage.getItem('phoneNumber'), 'YELLOW ALERT: I\'m going ' + currentSpeed + 'mph in a ' + currentSpeedLimit + 'mph zone.');
                  $('#contactNotified').toggle();
                  vibrationController.contactAlerted();
                  warnings++;
               }

               vibrationController.warning();
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
          //smsController.sendSMS("ALERT: Speedometer encountered an error tracking speed");
      }
 }

 function hidePopup() {
     $("#popup").fadeOut();
 }

//Get the speed limit to insert into a thing. Returns either the speed limit or null.
function getSpeedLimit() {
    return 45;
 }
