
function afterFcm(regId){
    console.log(regId);
    chrome.storage.local.set({fcmid: regId});
    sendFCM(regId);
}

function sendFCM(regId){
    chrome.identity.getProfileUserInfo(function(userInfo){
      if(userInfo.id != ''){
          console.log('no login');

      }else{
          $.ajax({
              url:'http://localhost:14080/addfcm',
              dataType:'post',
              type:'json',
              success: function(data){
                console.log(data);
              },
              data:JSON.stringify({'userid':userInfo.id,'fcmid':regId})
            });
      }  
    });
}

chrome.storage.local.get('onserver',function(result){
    if(result['onserver']){
      console.log('onserver');
      console.log(result['onserver']);
    }else{
      console.log('not on server'); 
      chrome.storage.local.get('fcmid', function(result) {
          if(result['fcmid']){
            sendFCM(result['fcmid']);
            console.log('creating fcm');
          }else{
            var senderIds = ["828025514635"];
            chrome.gcm.register(senderIds, afterFcm);
          }
      });
    }
});

function registerCallback(registrationId) {

  console.log(registrationId);
  regId = registrationId;
  // Send the registration token to your application server.
  chrome.storage.local.set({fcmid: regId});
  
  sendRegistrationId(function(succeed) {
    // Once the registration token is received by your server,
    // set the flag such that register will not be invoked
    // next time when the app starts up.
    console.log(succeed)
    if (succeed)
      chrome.storage.local.set({registered: true});
      console.log('fcm obtained');
  });
}

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.set({onserver: false});
  chrome.storage.local.get("registered", function(result) {
    if (result["registered"])
      return;
    // Up to 100 senders are allowed.
    console.log('called');
    var senderIds = ["828025514635"];
    chrome.gcm.register(senderIds, registerCallback);
  });
});


chrome.gcm.onMessage.addListener(function(message) {
  // A message is an object with a data property that
  // consists of key-value pairs.
  console.log(message);
});



