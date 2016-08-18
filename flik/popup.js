var currentUrlDiv = document.getElementById("url");
var flick = document.getElementById("goFlick");
var flinkStatus = document.getElementById("zing");
var currentUrl;


chrome.tabs.query({'active':true}, function(tabs){
	console.log(tabs)
	var url = tabs[0].url;
	currentUrlDiv.value = url;
	currentUrl = url;	
});

function createTab(link){
	chrome.tabs.create({
		url:link
	});
}
function sendFCM(regId){
    chrome.identity.getProfileUserInfo(function(userInfo){
          $.ajax({
              url:'http://localhost:14080/addfcm',
              dataType:'post',
              type:'json',
              success: function(data){
                console.log(data);
              },
              data:JSON.stringify({'userid':userInfo.id,'fcmid':regId})
            }); 
    });
}



flick.onclick = function(){
	$.ajax({
		url:'http://localhost:14080/flink',
		dataType:'json',
		type:'post',
		success: function(data){
			flinkStatus.innerText = data.code;
			createTab(data.code);
			console.log(data.code);
		},
		data:JSON.stringify({'link':currentUrl})

	});
}



loginButton = document.getElementById("login");
loginButton.onclick = function(){
	console.log("login button");
		chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
			chrome.identity.getProfileUserInfo(function(userInfo){
			  	$.ajax({
					url:'http://localhost:14080/user',
					dataType:'json',
					type:'post',
					success: function(data){
						console.log(data);
						chrome.storage.local.get('fcmid', function(result) {
							if(result['fcmid']){
						            sendFCM(result['fcmid']);
						            console.log('creating fcm');
						          }else{
						            var senderIds = ["828025514635"];
						            chrome.gcm.register(senderIds, afterFcm);
						          }
						      });
					},
					data:JSON.stringify({'token':token})
				});
		});
	});
}


chrome.identity.getProfileUserInfo(function(userInfo){
  console.log(userInfo);
})