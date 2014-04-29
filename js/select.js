/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 *
 * @example $(':checkbox').selected();
 * @desc Checks all checkboxes
 *
 * @name select
 * @type jQuery
 * @cat Plugins/Form
 */
$.fn.select = function(select) {
    if (select == undefined) select = true;
    return this.each(function() {
        var t = this.type;
        if (t == 'checkbox' || t == 'radio')
            this.checked = select;
        else if (this.tagName.toLowerCase() == 'option') {
            var $sel = $(this).parent('select');
            if (select && $sel[0] && $sel[0].type == 'select-one') {
                // deselect all other options
                $sel.find('option').select(false);
            }
            this.selected = select;
        }
    });
};

$.fn.autolink = function () {
    return $(this).each(function() {
        var el = $(this);
        var re = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
        el.html(el.html().replace(re, '<a href="$1">$1</a>'));
    });
};

$.fn.autohash = function () {
    return $(this).each(function() {
        var el = $(this);
        var re = /#(\w+)/g;
        el.html(el.html().replace(re, '<a href="http://twitter.com/search?q=%23$1">#$1</a>'));
    });
};
