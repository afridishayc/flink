from google.appengine.ext import ndb

class UserInfo(ndb.Model):
	name = ndb.StringProperty()
	email = ndb.StringProperty()
	userid = ndb.StringProperty()
	picture = ndb.StringProperty()
	gender = ndb.StringProperty()
	fcmids = ndb.StringProperty(repeated=True)

class LinkModel(ndb.Model):
 	link = ndb.StringProperty()
	user = ndb.StringProperty()
	createdOn = ndb.DateTimeProperty(auto_now_add=True)

class Friends(ndb.Model):
	userid = ndb.StringProperty()
	friend = ndb.StringProperty()

class FriendLink(ndb.Model):
	linkid = ndb.StringProperty()
	friend = ndb.StringProperty()
	seen = ndb.BooleanProperty(default=True)