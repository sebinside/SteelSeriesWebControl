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
        var text = $("mouseStaticText").val();

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

    },
    sendHelloWorldAnimation: function () {

    }

};