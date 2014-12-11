atmosphere = {
    AtmosphereRequest: function () {
        return {
            onError : function(response) {
            },
            onClose : function(response) {
            },
            onOpen : function(response) {
            },
            onMessage : function(response) {
            },
            onReconnect : function(request, response) {
            },
            onMessagePublished : function(response) {
            },
            onTransportFailure : function (reason, request) {
            },
            onLocalMessage : function (response) {
            }
        }
    },
    subscribe: function (request) {
        var _request = request;
        return {
            push: function(data){
                _request.onMessage({responseBody:data});
            },
            request: function() {
                return {
                    isOpen: function() {
                        return false;
                    }
                }
            }
        }
    }
}