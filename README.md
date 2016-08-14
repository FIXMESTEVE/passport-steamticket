Work in progress.

#passport-steamticket

This is a strategy for passport.js that uses Steam Auth Tickets for sessionless auth based on the Steam ID extracted from the ticket.

This is different than passport-steam, which makes use of Steam's OpenID login.

You may be interested in this strategy if your Steam game client needs to be authenticated on your backend. If you don't know what is and how to use a Steam Auth Ticket, get in touch with Valve.

##Usage

###Configure

The Steam ticket authentication strategy is constructed as follows:
`new SteamticketStrategy(options, verify)`

`options` is an object literal containing the required options for authentication via Steamworks.
- `key` is a required string containing your Steamworks team WebAPI key.
- `appid` is a required int containing your game/software appid
- `ticketFromRequest` is a required function that accepts a request as the only parameter and returns either the ticket or _null_

Here is an exemple configuration:
```
var SteamStrategy = require('passport-steamticket').Strategy;
var opts = {}; 

opts.key = 'AFOIJZEOIZEJEOIZJEZOJDZDJ'; //it's not a real key btw
opts.appID = 13260;
opts.ticketFromRequest = return function(request) {
    var ticket = null;
    if (request)
    {
        ticket = request.body.ticket;
    }
    return ticket;
};

passport.use('steamticket', new SteamStrategy(opts, function(res, done) {
  	if(res)
	  {
	  	User.findOne({steamid: res.steamid}.then(function(err, user) {
	  	    if(err){
	  	      return done(err, false);
	  	    }
	        if (user) {
	            done(null, user);
	        } else {
	            done(null, false);
	        }
	    });
	  }
	  else
	  {
		  done(null, false);
	  }
	}
));
```
`res` is an object literal delivered by Steam that contains the following infos. Only `res.steamid` is used here, but you may find use for the other ones.
```
"result": string,
"steamid": string,
"ownersteamid": string,
"vacbanned": bool,
"publisherbanned": bool
```

### Authenticate requests
Use `passport.authenticate()` specfying `steamticket` as the strategy.
```
app.post('/profile', passport.authenticate('steamticket', { session: false}),
    function(req, res) {
        res.send(req.user.profile);
    }
);
```
