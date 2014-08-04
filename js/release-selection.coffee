---
note: "this is needed for processing by jekyll"
---

hashToSelector = (h) -> h.replace /\./g, "\\." # http://stackoverflow.com/a/9930611/84283

isVersion = (s) ->
  s.match /[0-9.]+/
  
selectTab = (name) ->
  tabs = $(".product-tabs")
  tab = tabs.find("a[href=\"##{name}\"]")
  return unless tab.length>0
  index = tab.parent().index()
  tabs.data("ignoreActivate", true)
  tabs.tabs "option", "active", index
  
selectVersion = (version) ->
  # http://stackoverflow.com/a/13952352/84283
  $release = $(hashToSelector("#v#{version}"))
  return unless $release.length>0
  
  # if tabs are present, switch tab panel to show changelog content
  $tabPanel = $release.parents('.ui-tabs-panel')
  if not $tabPanel.is(":visible")
    tabName = $tabPanel.attr('id')
    selectTab(tabName) if tabName

  $release.addClass('highlighted')
  $(document.body).animate
    scrollTop: $release.offset().top - 10 # 10px margin
    , 1000
    
selectRelease = ->
  $releases = $(".changelog .release").removeClass('highlighted')
  version = location.hash[1..-1]
  return unless isVersion version
  selectVersion version
  
selectReleaseAfterTabsGetInitialized = -> $(selectRelease)
  
$(window).on "hashchange", selectReleaseAfterTabsGetInitialized
$(window).on "changelog-rendered", selectReleaseAfterTabsGetInitialized
  
