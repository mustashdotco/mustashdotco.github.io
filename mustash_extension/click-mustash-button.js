(function(){

  var startTime = (new Date()).getTime();
  var clicked = false;

  var checkInterval = function checkInterval() {

    var now = (new Date()).getTime();
    var button = $('#controls-subscription');

    if (button) {
      clicked = true;
      $('#controls-subscription').click().hide();
      return;
    }

    if (now - startTime < 10000) {
      setTimeout(checkInterval, 20);
    }

  };

  checkInterval();

})();
