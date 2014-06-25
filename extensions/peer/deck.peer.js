/*
  By default, 'C' brings up the connect panel.

Add this HTML to the talk

    <!-- deck.connect snippet -->
    <form action="." method="get" class="connect-form">
      <span class="connect-controls">
        <label for="connect-slide">Connect to a remote:</label>
        <input type="text" name="slidenum" id="connect-slide" list="connect-datalist">
        <datalist id="connect-datalist"></datalist>
        <input type="submit" value="Go">
        <div><a href="#" id="connect-host">Make this a remote</a></div>
      </span>
      <span class="connect-message"></span>
    </form>

<!-- and include all .js and .css files from this folder. -->

*/

(function($, undefined) {

  function NetworkControl() {
    this.id = null;
    var _this = this;
    this.send = function () {/*nothing yet*/};

    this.host = function (onConnect) {
      console.log("This is the controller");
      this.id = "s" + Math.floor(Math.random()*1000);
      var peer = new Peer(this.id, {key: 'g9eb986tyyqr529'});

      peer.on('connection', function(conn) {
        console.log("I am now controlling a presentation.");
        onConnect();

        _this.send = function (data) {
          console.log("Sending ", data);
          conn.send(data);
        }
      });
    }

    this.getId = function () {
      return this.id;
    }

    this.join = function (other, onData) {
      this.id = "slides" + Math.floor(Math.random()*100);
      var peer = new Peer(this.id, {key: 'g9eb986tyyqr529'});
      var conn = peer.connect(other);
      conn.on('open', function(){
        console.log("I connected to a remote control.");
      });
      conn.on('data', function(data) {
          onData(data);
      });
    }
  }

  var $document = $(document);

  var bindKeyEvents = function() {
    $document.unbind('keydown.deckconnectto');
    $document.bind('keydown.deckconnectto', function(event) {
      var key = $.deck('getOptions').keys.connect;
      if (event.which === key || $.inArray(event.which, key) > -1) {
        event.preventDefault();
        $.deck('toggleConnect');
      }
    });
  };

  var handleFormSubmit = function() {
    var options = $.deck('getOptions');
    var $form = $(options.selectors.connectForm);

    $form.unbind('submit.deckconnectto');
    $form.bind('submit.deckconnectto', function(event) {
      var $field = $(options.selectors.connectInput);
      var hostId = $field.val();

      var net = new NetworkControl();
      var onData = function(data) {
        if (data.slide === undefined) return;
        //$.deck('go', isNaN(data) ? data : data - 1);  
        console.log("Going to slide " + data.slide);
        $.deck('go', data.slide);
      }
      net.join(hostId, onData);
      $.deck('hideConnect');
      $field.val('');
      event.preventDefault();
    });
  };

  var handleHostButton = function() {
    var options = $.deck('getOptions');
    var $button = $(options.selectors.connectHost);
    $button.on("click", function () {
      var net = new NetworkControl();
      var connectCallback = function () {$.deck('hideConnect');}
      net.host(connectCallback);
      $(options.selectors.connectMessage).text("Connect client to this id: " + net.getId());
      $(options.selectors.connectControls).hide();

      $(document).bind('deck.change', function(event, from, to) {
         net.send({slide:to});
      });
    });
  };

  /*
  Extends defaults/options.
  options.keys.connectto
  */
  $.extend(true, $.deck.defaults, {
    classes: {
      connect: 'deck-connect'
    },

    selectors: {
      connectControls: ".connect-controls",
      connectMessage: ".connect-message",
      connectForm: '.connect-form',
      connectInput: '#connect-slide',
      connectHost: '#connect-host'
    },

    keys: {
      connect: 67 // c
    },

  });

  /*
  jQuery.deck('showConnect')

  Shows the Connect form by adding the class specified to the deck container.
  */
  $.deck('extend', 'showConnect', function() {
    var options = $.deck('getOptions');
    $.deck('getContainer').addClass(options.classes.connect);
    $(options.selectors.connectForm).attr('aria-hidden', false);
    $(options.selectors.connectInput).focus();
  });

  /*
  jQuery.deck('hideConnect')

  Hides the Connect form by removing the class specified from the deck container.
  */
  $.deck('extend', 'hideConnect', function() {
    var options = $.deck('getOptions');
    $(options.selectors.connectInput).blur();
    $.deck('getContainer').removeClass(options.classes.connect);
    $(options.selectors.connectForm).attr('aria-hidden', true);
  });

  /*
  jQuery.deck('toggleConnect')

  Toggles between showing and hiding the Connect form.
  */
  $.deck('extend', 'toggleConnect', function() {
    var options = $.deck('getOptions');
    var hasClass = $.deck('getContainer').hasClass(options.classes.connect);
    $.deck(hasClass ? 'hideConnect' : 'showConnect');
  });

  $document.bind('deck.init', function() {
    bindKeyEvents();
    handleFormSubmit();
    handleHostButton();
  });
})(jQuery);

