---
note: "this is needed for processing by jekyll"
---

updateShowcase = (selected) ->
  $('.highlight').each ->
    el = $(@)
    el.removeClass 'active'
    num = el.data('showcase')
    el.addClass 'active' if num==selected

$.fn.navigen = (options) ->
  target = $(options.target)
  i = 0
  $(@).each ->
    i++
    el = $(@)
    button = $("<a>")
    button.addClass 'active' if (el.css('display')!='none')
    button.on 'click', ->
      el.trigger('activate')
    
    index = i
    el.on 'activate', ->
      el.parent().children().css('display', 'none')
      el.css('display', 'block')
      button.parent().children().removeClass 'active'
      button.addClass 'active'
      updateShowcase(index)
    
    target.append(button)
    
$.fn.showcase = (options) ->
  $(@).each ->
    el = $(@)
    el.on 'click', ->
      num = el.data('showcase')
      return unless num
      $('#screenshot-box-'+num).trigger('activate')    