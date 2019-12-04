"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("rxjs/add/operator/map");
var AuthenticationService = (function () {
    function AuthenticationService(http) {
        this.http = http;
        if (BACKEND_API_ENDPOINT) {
            this.apiUrl = BACKEND_API_ENDPOINT;
        }
        // get token cookie
        this.currentUser = { token: getCookie('token') };
        function getCookie(name) {
            var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }
    }
    AuthenticationService.prototype.login = function (username, password) {
        password = password.replace(/ /g, '%20');
        // return this.http.post('/api/authenticate', JSON.stringify({ username: username, password: password }))
        // Workaround to fix login !!! TODO: make it better, shitty code :)
        return this.http.get(this.apiUrl + 'user/exists?login=' + username + '&pass=' + password)
            .map(function (response) {
            if (response.json().result !== false) {
                var date = new Date(new Date().getTime() + 60 * 100000);
                document.cookie = 'username=' + username + '; expires=' + date.toUTCString();
                document.cookie = 'id=' + response.json().result.user_id + '; expires=' + date.toUTCString();
                document.cookie = 'token=' + response.json().result.token + '; expires=' + date.toUTCString();
                return true;
            }
            else {
                return false;
            }
            // login successful if there's a jwt token in the response
            //                if(response.json().items && response.json().items.length > 0) {
            //                    let token = response.json() && response.json().items[0].sys.id;
            //                    //console.log(response.json().items[0].sys.id);
            //                    if (token) {
            //                        // set token property
            //                        this.token = token;
            //
            //                        // store username and jwt token in local storage to keep user logged in between page refreshes
            //                        localStorage.setItem('currentUser', JSON.stringify({username: username, token: token}));
            //
            //                        // return true to indicate successful login
            //                        return true;
            //                    } else {
            //                        // return false to indicate failed login
            //                        return false;
            //                    }
            //                } else return false;
        });
    };
    AuthenticationService.prototype.logout = function () {
        // clear token remove user from local storage to log user out
        this.token = null;
        var date = new Date(new Date().getTime() + 1000);
        document.cookie = 'username=' + 0 + '; expires=' + date.toUTCString();
        document.cookie = 'token=' + 0 + '; expires=' + date.toUTCString();
        document.cookie = 'id=' + 0 + '; expires=' + date.toUTCString();
    };
    return AuthenticationService;
}());
AuthenticationService = __decorate([
    core_1.Injectable()
], AuthenticationService);
exports.AuthenticationService = AuthenticationService;
