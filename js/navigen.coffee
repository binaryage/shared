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
    index = i
    el.on 'activate', ->
      el.parent().children().css('display', 'none')
      el.css('display', 'block')
      updateShowcase(index)
    
$.fn.showcase = (options) ->
  $(@).each ->
    el = $(@)
    el.on 'click', ->
      num = el.data('showcase')
      return unless num
      $('#screenshot-box-'+num).trigger('activate')    