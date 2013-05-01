(function() {
    "use strict";

    var WebSocket = window.WebSocket || window.MozWebSocket;
    if (!WebSocket) {
        alert('Your browser does not support websockets');
    }

    var socket,
        logBox = $('#log');

    var dataHistory = [],
        dataIndex = -1;

    function log(message) {
        var val = logBox.val();
        val = message + '\r\n' + val;
        logBox.val(val);
    }

    function connect() {
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            return;
        }

        var url = $('#url').val();
        socket = new WebSocket(url);
        log('Connecting to ' + url);

        socket.onopen = function() {
            log('Connection opened');
            $('#data').focus();
            updateState();
        };

        socket.onclose = function() {
            log('Connection closed');
            $('#url').focus();
            updateState();
        };

        socket.onerror = function(e) {
            log('Error occured');
            updateState();
        };

        socket.onmessage = function(e) {
            log('Received: ' + e.data);
        };

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('url', url);
        }

        updateState();
    }

    function disconnect() {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return;
        }

        socket.close();
    }

    function send() {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return;
        }

        var dataInput = $('#data'),
            data = $('#data').val();
        socket.send(data);
        log('Sent: ' + data);

        dataHistory.unshift(data);
        dataIndex = -1;
        dataInput.val('');
        dataInput.focus();
    }

    function updateState() {
        var state = socket ? socket.readyState : WebSocket.CLOSED,
            connect = $('#connect');

        var disabled = false;
        if (state === WebSocket.CLOSED) {
            connect.text('Connect');
        } else if (state === WebSocket.OPEN) {
            connect.text('Disconnect');
        } else if (state === WebSocket.CONNECTING) {
            connect.text('Connecting...');
            disabled = true;
        } else if (state === WebSocket.CLOSING) {
            connect.text('Closing...');
            disabled = true;
        }

        connect.prop('disabled', disabled);

        $('#send').prop('disabled', state !== WebSocket.OPEN);
    }

    $('#connect').click(function() {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            connect();
        } else if (socket.readyState === WebSocket.OPEN) {
            disconnect();
        }
    });

    $('#send').click(send);

    $('#url').keyup(function(e) {
        if (e.which === 13) {
            // Enter key
            connect();
        }
    });

    $(window).keyup(function(e) {
        if (e.which === 27) {
            // Esc key
            e.preventDefault();
            disconnect();
        }
    });

    $('#data').keyup(function(e) {
        var newIndex;
        if (e.which === 38) {
            // Up arrow key
            if (dataIndex + 1 < dataHistory.length) {
                dataIndex++;
                $('#data').val(dataHistory[dataIndex]);
            }
        } else if (e.which === 40) {
            // Down arrow key
            if (dataIndex >= 0) {
                dataIndex--;
                $('#data').val(dataIndex === -1 ? '' : dataHistory[dataIndex]);
            }
        } else if (e.which === 13) {
            // Enter key
            e.preventDefault();
            e.stopPropagation();
            send();
        }
    });

    var defaultUrl;
    if (typeof localStorage !== 'undefined') {
        defaultUrl = localStorage.getItem('url');
    }

    $('#url').val(defaultUrl || 'ws://echo.websocket.org');

    updateState();
}());
