---
note: "this is needed for processing by jekyll"
---

window.showTerminalHelp = (el) ->
  $el = $(el)
  $el.parent().children(".terminal-details").toggle()

decorateTerminals = (selector) ->
  items = $(selector)
  detailsBox = "
  <p class=\"terminal-details info-box\" style=\"display:none\">
  1. Please open <code>/Applications/Utilities/Terminal.app</code>.<br>
  2. Then copy and paste the above command into the prompt and hit <code>ENTER</code>.<br>
  <br>
  Didn't work? Make sure you really copied the whole line as is.<br>
  Or report the issue at <a href=\"mailto:support@binaryage.com\">support@binaryage.com</a>
  </p>"
  helpBox = "<div class=\"terminal-help\"><a href=\"javascript:void(0)\" onclick=\"showTerminalHelp(this)\">How to run commands in Terminal?</a>"+detailsBox+"</div>"
  items.each ->
    el = $(this)
    el.after helpBox

$ ->
  decorateTerminals(".terminal")