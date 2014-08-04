---
note: "this is needed for processing by jekyll"
---

tabPrefix = "tab-"

normalizeHash = (raw) ->
  # remove multiple dashes and strip dashes from the beginning and end
  raw.replace(/[-]+/, "-").match(/^[-]*(.*?)[-]*$/)[1]

# product pages which want to render tabs have to define build_tabs: 1 in yaml front matter
# this will cause inclusion of .tabs template (see product-home.html)
# here we go through the content and convert every new H2 tag into a new tab with same name
# tabs are implemented using jQuery UI tabs component
transformContentIntoTabsAndPanes = (contentSelector, tabsSelector) ->
  tabs = $(tabsSelector)
  return  unless tabs.length # tabs not enabled
  ul = tabs.find("ul")
  cur = undefined
  items = $(contentSelector)
  items.each ->
    el = $(this)
    return  if el.hasClass("panes") or el.hasClass("tabs") # is this needed?
    tag = el.prop("tagName")
    return  if tag in ["SCRIPT", "NOSCRIPT", "STYLE"]
    if tag is "H2"
      name = el.html()
      id = tabPrefix+normalizeHash(name.toLowerCase().replace(/[^a-z0-9]/g, "-")) # hash-friendly normalization
      li = $("<li/>")
      a = $("<a/>").attr("href", "#" + id).html(name)
      li.append a
      a.append "<div class=\"shadow\"/>"
      ul.append li
      cur = $("<div/>").addClass(id).addClass("page-content").prop("id", id)
      tabs.append cur
      el.remove()
    else
      cur.append el  if cur

  tabs.tabs activate: (event, ui) ->
    if tabs.data("ignoreActivate")
      # tab was activated when going back in history
      tabs.data("ignoreActivate", false)
      return
    # add tab location into history, also prevents page jump
    # http://lea.verou.me/2011/05/change-url-hash-without-page-jump
    if ui.newTab.index()>0
      hash = normalizeHash(ui.newPanel.attr("id")[tabPrefix.length..-1]) # strip tab- prefix
      
    if hash
      hash = "#" + hash
    else
      hash = window.location.pathname
      
    if history.pushState
      history.pushState null, null, hash
    else
      window.location.hash = hash # older browsers fallback
      
  selectTab = (hash) ->
    name = normalizeHash(hash[1..-1])
    if name==""
      tab = tabs.find("a").first()
    else
      tab = tabs.find("a[href=\"##{tabPrefix}#{name}\"]")
    return unless tab.length>0
    index = tab.parent().index()
    if index != tabs.tabs("option", "active")
      tabs.data("ignoreActivate", true)
      tabs.tabs "option", "active", index
    
  selectTabWhenInitialized = ->
    $(selectTab(location.hash))

  # hash changes should reflect in tab selection, but without adding new item into history
  $(window).on "hashchange", selectTabWhenInitialized
    
  $('html').addClass('product-tabs-present')
  tabs.show()
  selectTab(location.hash)

$ ->
  transformContentIntoTabsAndPanes(".product-content .container > *", ".product-tabs")