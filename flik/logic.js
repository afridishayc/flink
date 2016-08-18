  var config = {
    apiKey: "AIzaSyCpqtQAStwDREIGwxlhxyckQTQ7k3ZGFOE",
    authDomain: "flink-7260c.firebaseapp.com",
    databaseURL: "https://flink-7260c.firebaseio.com",
    storageBucket: "flink-7260c.appspot.com",
  };
  firebase.initializeApp(config);

chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    console.log(token);
});  


function registerCallback(registrationId) {

  console.log(registrationId);
  if (chrome.runtime.lastError) {
    // When the registration fails, handle the error and retry the
    // registration later.



    return;
  }

  // Send the registration token to your application server.
  
  sendRegistrationId(function(succeed) {
    // Once the registration token is received by your server,
    // set the flag such that register will not be invoked
    // next time when the app starts up.
    console.log(succeed)
    if (succeed)
      chrome.storage.local.set({registered: true});
  });
}

function sendRegistrationId(callback) {
  // Send the registration token to your application server
  // in a secure way.
}

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get("registered", function(result) {
    // If already registered, bail out.
    if (result["registered"])
      return;

    // Up to 100 senders are allowed.
    var senderIds = ["828025514635"];
    chrome.gcm.register(senderIds, registerCallback);
  });
});

chrome.gcm.onMessage.addListener(function(message) {
  // A message is an object with a data property that
  // consists of key-value pairs.
  console.log(message);
});



