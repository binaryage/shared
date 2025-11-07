---
note: "this is needed for processing by jekyll"
---

(function() {
  var decorateTerminals;

  window.showTerminalHelp = function(el) {
    var $el;
    $el = $(el);
    return $el.parent().children(".terminal-details").toggle();
  };

  decorateTerminals = function(selector) {
    var detailsBox, helpBox, items;
    items = $(selector);
    detailsBox = "<p class=\"terminal-details info-box\" style=\"display:none\"> 1. Please open <code>/Applications/Utilities/Terminal.app</code>.<br> 2. Then copy and paste the above command into the prompt and hit <code>ENTER</code>.<br> <br> Didn't work? Make sure you really copied the whole line as is.<br> Or report the issue at <a href=\"mailto:support@binaryage.com\">support@binaryage.com</a> </p>";
    helpBox = "<div class=\"terminal-help\"><a href=\"javascript:void(0)\" onclick=\"showTerminalHelp(this)\">How to run commands in Terminal?</a>" + detailsBox + "</div>";
    return items.each(function() {
      var el;
      el = $(this);
      return el.after(helpBox);
    });
  };

  $(function() {
    return decorateTerminals(".terminal");
  });

}).call(this);
