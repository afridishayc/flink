import webapp2
import json
import logging
from google.appengine.api import urlfetch
from google.appengine.api import taskqueue
from models import *

class UserHandler(webapp2.RequestHandler):
	def post(self):
		jsonData = json.loads(self.request.body)
		accessToken = jsonData['token']
		result = urlfetch.fetch(url="https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken)
		result = json.loads(result.content)
		logging.info(result)
		if 'error' in result:
			code = '0'
		else:
			user = UserInfo().get_by_id(result['sub'])
			if not user:
				user = UserInfo(id=result['sub'])
				user.name = result['name']
				user.picture = result['picture']
				user.email = result['email']
				user.gender = result['gender']
				user.userid = result['sub']
				user.put()
				code = 2
			else:
				code = 1

		self.response.headers['Content-Type'] = 'application/json'
		self.response.write(json.dumps({'code':code}))

class AddFCM(webapp2.RequestHandler):
	def post(self):
		jsonData = json.loads(self.request.body)
		logging.info(jsonData)
		user = UserInfo.get_by_id(jsonData['userid'])
		user.fcmids = user.fcmids.append(jsonData['fcmid'])
		user.put()
		self.response.headers['Content-Type'] = 'application/json'
		self.response.write(json.dumps({'code':1}))

class GetInfo(webapp2.RequestHandler):
	def post(self):
		jsonData = json.loads(self.request.body)
		token = jsonData['token']
		result = urlfetch.fetch(url="https://www.googleapis.com/oauth2/v3/info?access_token=" + accessToken)
		logging.info(result.content)

class FlinkHandler(webapp2.RequestHandler):
	def post(self):
		jsonData = json.loads(self.request.body)
		token = jsonData['token']
		link = jsonData['link']
		friends = jsonData['to']
		result = urlfetch.fetch(url="https://www.googleapis.com/oauth2/v3/info?access_token=" + accessToken)
		tokenData = json.loads(result)
		if 'error' in tokenData or 'error_description' in tokenData:
			code = 0
		else:
			taskDict = dict()
			taskDict['link'] = link
			taskDict['to'] = friends
			user = UserInfo.get_by_id(tokenData['sub'])
			if user:
				taskDict['from'] = user.name
			else:
				logging.error('invalid user flinked')
				return
			objLink = LinkModel()
			objLink.link = link
			objLink.user = user.userid
			objLink.put()
			taskqueue.add(url='/pushlinks', payload=json.dumps(taskDict))
		self.response.headers['Content-Type'] = 'application/json'
		self.response.write(json.dumps({'code':link}))

class PushLinks(webapp2.RequestHandler):
	def post(self):
		jsonData = json.loads(self.request.body)
		for friend in jsonData['to']:
			friend = UserInfo.get_by_id(friend)
			if not friend:
				continue
			linkData = { 
							"data":{"link":jsonData['link'], "from":jsonData['from']},
							"to" :friend.fcmids[-1]
						}
			result = urlfetch.fetch(url="https://fcm.googleapis.com/fcm/send",payload=json.dumps(linkData),method=urlfetch.POST,headers={'Content-Type': 'application/json','Authorization':'key=AIzaSyA3NWczJSBoFBOysKDggy3DGml5g_aFC6A'})
			logging.info(result.content)

app = webapp2.WSGIApplication([
    ('/user', UserHandler),
    ('/addfcm',AddFCM),
    ('/flink',FlinkHandler),
    ('/pushlinks',PushLinks)
    
], debug=True)
