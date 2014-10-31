var Twit = require('twit');
var bot = {};

bot.twit = new Twit({
  consumer_key: process.env.OBIWAN_CONSUMER_KEY,
  consumer_secret: process.env.OBIWAN_CONSUMER_SECRET,
  access_token: process.env.OBIWAN_ACCESS_TOKEN,
  access_token_secret: process.env.OBIWAN_ACCESS_TOKEN_SECRET
});

console.log('Obiwan will commence teaching the ways of the force');

var handle = function(err) {
  if (err) console.log(err);
};

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

var get_params = function() {
  var d = new Date(Date.now());
  return {
    count: 100,
    result_type: 'popular',
    lang: 'en',
    since: d.getUTCFullYear() + '-' +  (d.getUTCMonth()+1) + '-' +   d.getDate(),
    q: shuffle(['never', 'always', 'nobody', 'everyone', 'everybody'])[0]
  };
};

var find_absolute = function(tweets) {
  shuffle(tweets);
  for (var i = 0; i < tweets.length; i++) {
    if (tweets[i].text.indexOf('@') === -1)
      return {status: '@' + tweets[i].user.screen_name + ' only a sith deals in absolutes',
              in_reply_to_status_id: tweets[i].id_str};
  }
};

var non_follower = function(friends, followers) {
  shuffle(friends);
  for (var i = 0; i < friends.length; i++) {
    if (followers.indexOf(friends[i]) !== -1)
      return friends[i];
  }
};

var tweet = function() {
  console.log('accusing someone of being a sith');
  var params = get_params();
  bot.twit.get('search/tweets', params, function (err, reply) {
    handle(err);
    var tweet = find_absolute(reply.statuses);
    if (tweet)
      bot.twit.post('statuses/update', tweet, function(err) {handle(err);});
  });
};

var follow = function() {
  console.log('following a random follower of one of obiwan\'s followers');
  bot.twit.get('followers/ids', {screen_name: 'obiwanwisdom'}, function(err, following) {
    handle(err);
    bot.twit.get('followers/ids', {user_id: shuffle(following.ids)[0]}, function(err, reply) {
      handle(err);
      bot.twit.post('friendships/create', {id: shuffle(reply.ids)[0]}, function(err) {handle(err);});
    });
  });
};

var unfollow = function() {
  console.log('unfollowing someone who doesn\'t follow obiwan back');
  bot.twit.get('followers/ids', function(err, followers) {
    handle(err);
    bot.twit.get('friends/ids', function(err, friends) {
      handle(err);
      var target = non_follower(friends.ids, followers.ids);
      if (target)
        bot.twit.post('friendships/destroy', {id: target}, function(err) {handle(err);});
    });
  });
};

setInterval(function() {
  try {
    shuffle([tweet, follow, unfollow])[0]();
  } catch (err) {
    handle(err);
  }
}, 5 * 60 * 1000); // Run every 5 minutes
