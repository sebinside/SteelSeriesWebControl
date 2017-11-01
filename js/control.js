var Control = {

    heartBeatInterval: Int = 10000,
    heartBeatActivated: Boolean = true,
    gameName: String = "WEB_CONTROL",
    gameDisplayName: String = "Web Control",
    baseAddress: String = "http://127.0.0.1",
    connected: Boolean = false,

    init: function () {
        this.showConnectionMessage(0);
        var _control = this;
        window.setInterval(function () {

            if (_control.connected && _control.heartBeatActivated) {
                _control.sendHeartBeat();
            }

        }, _control.heartBeatInterval)
    },
    sendHeartBeat: function () {
        console.log("Sending heartbeat now.");

        var json = {
            "game": this.gameName
        };

        this.sendAjaxRequest("/game_heartbeat", json, function () {
        }, function () {
        });
    },
    openPortFile: function (isWindows) {
        // Using a callback is not possible, direct access is denied by cross-origin
        if (isWindows) {
            window.open("%PROGRAMDATA%/SteelSeries/SteelSeries Engine 3/coreProps.json");
        } else {
            window.open("/Library/Application Support/SteelSeries Engine 3/coreProps.json");
        }
    },
    showConnectionMessage: function (number) {
        var alerts = [$("#AlertInitConnection"),
            $("#AlertConnected"),
            $("#AlertConnectionError"),
            $("#AlertConnectionAborted")];

        alerts.forEach(function (d, i) {
            d.hide();
        });

        alerts[number].show();
    },
    makeURL: function (endPoint) {
        var port = $("#gameSensePortNumber").val();
        var fullAddress = this.baseAddress + ":" + port + endPoint;
        console.log("Created request URL: " + fullAddress);
        return fullAddress;
    },
    sendAjaxRequest: function (endPoint, json, onSuccess, onError) {
        var _control = this;
        console.log("Sending request with data:");
        console.log(json);
        $.ajax({
            url: _control.makeURL(endPoint),
            type: "POST",
            data: JSON.stringify(json),
            contentType: "application/json"
        })
            .done(function (data) {
                console.log("Request success");
                onSuccess(data);
            })
            .fail(function (data) {
                console.log("Request error");
                console.log("Error Reason: " + data.statusText);
                console.log("Error Message: " + data.responseText);
                onError(done);
            });
    },
    registerWebControlGame: function () {

        var json = {
            "game": this.gameName,
            "game_display_name": this.gameDisplayName,
            "icon_color_id": 5
        };

        var _control = this;
        this.sendAjaxRequest("/game_metadata", json,
            function () {
                _control.showConnectionMessage(1);
                _control.connected = true;
            }, function () {
                _control.showConnectionMessage(2);
            });
    },
    unregisterGame: function () {
        console.log("Sending heartbeat now.");

        var json = {
            "game": this.gameName
        };

        var _control = this;
        this.sendAjaxRequest("/remove_game", json, function () {
            _control.connected = false;
            _control.showConnectionMessage(3);
        }, function () {
        });
    },
    changeHeartBeat: function () {
        this.heartBeatActivated = !this.heartBeatActivated;
    },
    sendGenericEvent: function (eventName, handlers, dataValue) {

        console.log("Sending generic event. Event Name is '" + eventName + "'.");

        var json = {
            "game": this.gameName,
            "event": eventName,
            "handlers": handlers
        };

        var _control = this;
        this.sendAjaxRequest("/bind_game_event", json, function () {

            console.log("Updated event. Sending trigger command!");

            var json = {
                "game": _control.gameName,
                "event": eventName,
                "data": {
                    "value": dataValue
                }
            };

            _control.sendAjaxRequest("/game_event", json, function () {
                console.log("Finished event update and trigger.")
            }, function () {
            });

        }, function () {
        })

    },
    updateMouseColor: function (lightOn) {
        var logo = $("#mouseColorLogo")[0].jscolor.rgb;
        var wheel = $("#mouseColorWheel")[0].jscolor.rgb;

        var light = 1;
        if (!lightOn)
            light = 0;

        var handlers = [
            {
                "device-type": "mouse",
                "zone": "logo",
                "mode": "color",
                "color": {"red": logo[0], "green": logo[1], "blue": logo[2]}
            },
            {
                "device-type": "mouse",
                "zone": "wheel",
                "mode": "color",
                "color": {"red": wheel[0], "green": wheel[1], "blue": wheel[2]}
            }
        ];

        var mouseEventName = "MOUSE_COLOR";

        this.sendGenericEvent(mouseEventName, handlers, light);
    },
    sendTactilePattern: function () {
        var pattern = $("#tactilePattern").val();

        console.log("Predefined tactile pattern: '" + pattern + "'.");

        var handlers = [
            {
                "device-type": "tactile",
                "zone": "one",
                "mode": "vibrate",
                "pattern": [{"type": pattern}]
            }
        ];

        var mouseTactileEventName = "MOUSE_TACTILE";

        this.sendGenericEvent(mouseTactileEventName, handlers, 100);
    },
    sendLongVibration: function () {
        var handlers = [
            {
                "device-type": "tactile",
                "zone": "one",
                "mode": "vibrate",
                "pattern": [
                    {
                        "type": "custom",
                        "length-ms": 2500
                    }
                ]

            }
        ];

        var mouseTactileEventName = "MOUSE_TACTILE";

        this.sendGenericEvent(mouseTactileEventName, handlers, 100);
    },
    sendStaticText: function () {
        var text = $("#mouseStaticText").val();

        var handlers = [
            {
                "device-type": "screened",
                "zone": "one",
                "mode": "screen",
                "datas": [
                    {
                        "has-text": true
                    }
                ]
            }
        ];

        var mouseScreenEventName = "MOUSE_SCREEN";

        this.sendGenericEvent(mouseScreenEventName, handlers, text);
    },
    sendNumberText: function () {
        var number = $("#mouseNumber").val();

        var handlers = [
            {
                "device-type": "screened",
                "zone": "one",
                "mode": "screen",
                "datas": [
                    {
                        "has-text": true,
                        "prefix": "Du bist #",
                        "icon-id": Math.floor((Math.random() * 17) + 1)
                    }
                ]
            }
        ];

        var mouseScreenEventName = "MOUSE_SCREEN";

        this.sendGenericEvent(mouseScreenEventName, handlers, number);
    },
    sendHelloWorldAnimation: function () {

        var handlers = [
            {
                "device-type": "screened",
                "zone": "one",
                "mode": "screen",
                "datas": [
                    {
                        "has-text": true,
                        "suffix": "Hello",
                        "length-millis": 500
                    },
                    {
                        "has-text": true,
                        "suffix": "World!",
                        "length-millis": 500,
                        "repeats": 3
                    }
                ]
            }
        ];

        var mouseScreenEventName = "MOUSE_SCREEN";

        this.sendGenericEvent(mouseScreenEventName, handlers, "");
    },
    sendKeyBoardColor: function () {

        var mainColor = $("#keyColorMain")[0].jscolor.rgb;
        var functionColor = $("#keyColorFunction")[0].jscolor.rgb;
        var numColor = $("#keyColorNum")[0].jscolor.rgb;
        var numPadColor = $("#keyColorNumPad")[0].jscolor.rgb;

        var handlers = [
            {
                "device-type": "keyboard",
                "zone": "main-keyboard",
                "mode": "color",
                "color": {"red": mainColor[0], "green": mainColor[1], "blue": mainColor[2]}
            },
            {
                "device-type": "keyboard",
                "zone": "function-keys",
                "mode": "color",
                "color": {"red": functionColor[0], "green": functionColor[1], "blue": functionColor[2]}
            },
            {
                "device-type": "keyboard",
                "zone": "number-keys",
                "mode": "color",
                "color": {"red": numColor[0], "green": numColor[1], "blue": numColor[2]}
            },
            {
                "device-type": "keyboard",
                "zone": "keypad",
                "mode": "color",
                "color": {"red": numPadColor[0], "green": numPadColor[1], "blue": numPadColor[2]}
            }
        ];

        var keyColorEventName = "KEYBOARD_COLOR_STATIC";

        this.sendGenericEvent(keyColorEventName, handlers, 100);
    },
    sendWASDColor: function () {

        var WASDColor = $("#keyColorWASD")[0].jscolor.rgb;
        var shadowString = "0px 0px 35px 1px rgba(" + Math.floor(WASDColor[0]) + "," + Math.floor(WASDColor[1]) + "," + Math.floor(WASDColor[2]) + ",1)";

        $(".key").css("box-shadow", shadowString);

        var keyColorEventName = "KEYBOARD_COLOR_WASD";

        var handlers = [
            {
                "device-type": "keyboard",
                "zone": "w",
                "mode": "color",
                "color": {"red": WASDColor[0], "green": WASDColor[1], "blue": WASDColor[2]}
            },
            {
                "device-type": "keyboard",
                "zone": "a",
                "mode": "color",
                "color": {"red": WASDColor[0], "green": WASDColor[1], "blue": WASDColor[2]}
            },
            {
                "device-type": "keyboard",
                "zone": "s",
                "mode": "color",
                "color": {"red": WASDColor[0], "green": WASDColor[1], "blue": WASDColor[2]}
            },
            {
                "device-type": "keyboard",
                "zone": "d",
                "mode": "color",
                "color": {"red": WASDColor[0], "green": WASDColor[1], "blue": WASDColor[2]}
            }
        ];

        this.sendGenericEvent(keyColorEventName, handlers, 100);
    },
    // TODO: Does not work right now...
    removeAllEvents: function () {

        var eventNames = ["KEYBOARD_COLOR_STATIC"];

        var _control = this;
        eventNames.forEach(function(d, i) {

            var json = {
                "game": _control.gameName,
                "event": d
            };

            _control.sendAjaxRequest("/remove_game_event", json, function () {
            }, function () {
            });
        })
    }

};