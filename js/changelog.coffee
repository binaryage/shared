---
note: "this is needed for processing by jekyll"
---

@parsePlaintextChangelog = (text) ->
  lines = text.split("\n")
  changelog = []
  release = undefined
  i = 0

  while i < lines.length
    line = $.trim(lines[i])
    i++
    
    # strip comments
    m = line.match(/^(.*?)(\s\/\/.*)$/)
    line = $.trim(m[1])  if m
    
    # skip empty lines
    continue  if line.length < 1 or line.match(/^\/\//)
    
    # parse first-char
    switch line[0]
      when "<"
        release.changes.push
          kind: "raw"
          text: line

      when "$"
        release.changes.push
          kind: "announce"
          text: $.trim(line.substring(1))

      when "*"
        release.changes.push
          kind: "improved"
          text: $.trim(line.substring(1))

      when "+"
        release.changes.push
          kind: "new"
          text: $.trim(line.substring(1))

      when "!"
        release.changes.push
          kind: "fixed"
          text: $.trim(line.substring(1))

      when "-"
        release.changes.push
          kind: "removed"
          text: $.trim(line.substring(1))

      else
        parts = line.split("-")
        release =
          version: $.trim(parts[0])
          date: $.trim(parts[1])
          note: $.trim(parts[2])
          changes: []

        changelog.push release
        
  changelog
  
@generateChangelogHTML = (el, changelog, getDownloadLinkForVersion, getReleaseDateText) ->
  $root = $(el)
  i = changelog.length - 1

  while i >= 0
    release = changelog[i]
    i--
    $release = $("<div class=\"release\"/>").attr('id', release.version)
    $titlebox = $("<div class=\"titlebox\"/>")
    $version = $("<h4/>")
    $a = $("<a>#{release.version}</a>").attr("href", getDownloadLinkForVersion(release.version))
    $date = $("<h5/>").html(getReleaseDateText(release.date))
    $version.append $a
    $titlebox.append $version, $date
    $release.append $titlebox
    $infobox = $("<div class=\"infobox\"/>")
    $changes = $("<ul class=\"changes\"/>")
    j = 0

    while j < release.changes.length
      change = release.changes[j]
      j++

      if change.kind is "raw"
        $changes.append change.text
        continue
        
      if change.kind is "announce"
        $li = $("<li/>")
        $info = $("<span class=\"info announce\"/>").html(change.text)
        $li.append "<span class=\"sticker\">&nbsp;</span>", $info
        $changes.append $li
        continue
        
      $li = $("<li/>")
      change.text = change.text.replace(/\(.*?\)/, (m) ->
        "<i>" + m + "</i>"
      )
      change.text = change.text.replace(/\[(.*?)\]/, (m, $1) ->
        "<em>" + $1 + "</em>"
      )
      $b = $("<b/>").text(change.kind)
      $sticker = $("<span class=\"sticker\"/>").addClass(change.kind)
      $sticker.append $b
      $info = $("<span class=\"info\"/>").html(change.text)
      $li.append $sticker, $info
      $changes.append $li
      
    $infobox.append $changes
    $release.append $infobox
    $root.prepend $release