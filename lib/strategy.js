var passport = require('passport-strategy')
    , util = require('util')
    , request = require('request');



/**
 * Strategy constructor
 *
 * @param options
 *          key: (REQUIRED) Your Steam WebAPI developer key.
 *          appID: (REQUIRED) Your game AppID.
 *          ticketFromRequest: (REQUIRED) User's ticket.
 *          passReqToCallback: If true the verify callback will be called with args (request, jwt_payload, done_callback).
 * @param verify - Verify callback with args (jwt_payload, done_callback) if passReqToCallback is false,
 *                 (request, jwt_payload, done_callback) if true.
 */
function SteamticketStrategy(options, verify) {

    passport.Strategy.call(this);
    this.name = 'steamticket';

    this._key = options.key;
    if (!this._Key) {
        throw new TypeError('SteamticketStrategy requires a key');
    }

    this._verify = verify;
    if (!this._verify) {
        throw new TypeError('SteamticketStrategy requires a verify callback');
    }

    this._appID = options.appID;
    if (!this._verify) {
        throw new TypeError('SteamticketStrategy requires an appID');
    }

    this._ticketFromRequest = options.ticketFromRequest;
    if (!this._ticketFromRequest) {
        throw new TypeError('SteamticketStrategy requires a function to retrieve a steamticket from requests (see option ticketFromRequest)');
    }

    this._passReqToCallback = options.passReqToCallback;
    this._verifOpts = {};

};
util.inherits(SteamticketStrategy, passport.Strategy);


/**
 * Authenticate request based on Steam auth ticket obtained from header or post body
 */
SteamticketStrategy.prototype.authenticate = function(req, options) {
    var self = this;

    var ticket = self._ticketFromRequest(req);

    if (!ticket) {
        return self.fail(new Error("No steam auth ticket"));
    }

    // Verify the Steam Auth Ticket
    request({
        url: 'https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v0001/?key=' +
                 this._key + '&ticket='+ ticket +'&appid=' + this._appID,
        method: "GET"
    }, function (error, response, body){
        if (body.response.error) {
            return self.fail(body.response.error.errordesc);
        } else {
            var verified = function(err, user, info) {
                if(err) {
                        return self.error(err);
                    } else if (!user) {
                        return self.fail(info);
                    } else {
                        return self.success(user, info);
                    }
                };

            try {
                if (self._passReqToCallback) {
                    self._verify(req, body.response.params.steamid, verified);
                } else {
                    self._verify(body.response.params.steamid, verified);
                }
            } catch(ex) {
                self.error(ex);
            }
        }
    });
};



/**
 * Export the Steamticket Strategy
 */
 module.exports = SteamticketStrategy;