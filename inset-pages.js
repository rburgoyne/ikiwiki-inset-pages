/*
*   inset-pages.js
*   Ryan Burgoyne
*   GECO, Inc.
*   6 March 2013
*
*   This script inserts expanding arrow links in front of each WikiLink of an ikiwiki site
*   which expand into an inset containing the linked page.
*/

const base_path = "/wiki";

const wikilink_pattern = new RegExp("^\.+(\/.*)?\/$"); // Match only relative directories
const rel_img_pattern = new RegExp("^(\.+\/)?.*\.(png|jpg)$"); // Match only relative images

$(document).ready(function() {
    // Make the header narrow when scrolling
    $(window).scroll( function(event) {    
        var scroll_top = $(window).scrollTop();
        if(scroll_top > 50 ){
            $('.pageheader .header').slideUp();
        }
        else{        
            $('.pageheader .header').slideDown();
        }
    });

    addToggleInsetArrows($('#content'));
    addToggleInsetArrows($('#backlinks'));

    $('#collapse-all').click( function() {
        $('span.toggle-inset-arrow').each( function() {
            collapse($(this));
        });
    });

    $('.page').on('click', 'span.toggle-inset-arrow', function(event) {
        event.preventDefault();
        collapse($(this));
        expand($(this));
    });
});

function collapse(toggle_inset_arrow) {
    var link = toggle_inset_arrow.next('a');
    if (link.next().is('div.inset')) {
        link.next().find('div.inset-content').slideUp(500, function() {
            link.next().remove();
        });            
        toggle_inset_arrow.find('img.closed').show();            
        toggle_inset_arrow.find('img.open').hide();
    }
}

// toggle_inset_arrow: the arrow span that is clicked to expand an inset page
function expand(toggle_inset_arrow) {
    var link = toggle_inset_arrow.next('a'); // Get the hyperlink following the arrow
    if (!link.next().is('div.inset')) { // Check if the inset is already expanded
    
        // Toggle the arrow image     
        toggle_inset_arrow.find('img.closed').hide();
        toggle_inset_arrow.find('img.open').show();

        // Load the page content from the link into a temporary div
        var href = link.attr('href');
        var load_div = $("<div/>");
        load_div.load(href, function() {
            // Pull out the divs that we will use
            var content = load_div.find("#content");
            var backlinks = load_div.find("#backlinks");

            // Package the html contained in these two divs in new divs with classes instead
            // of ids (they will no longer be unique)
            var content_div = $("<div/>", { 'class': 'inset-content' });            
            var backlinks_div = $("<div/>", { 'class': 'inset-backlinks' });
            content_div.html(content.html());
            backlinks_div.html(backlinks.html());
            content_div.append(backlinks_div);

            // Create a final div that will actually be displayed and insert the content
            var inset_div = $("<div/>", { 'class': 'inset' });
            inset_div.html(content_div);

            // Add a collapse button to the bottom of the inset
            var bottom_img = $("<img/>", { 'src': base_path + '/toggle-inset-arrow-bottom.png', 'class': 'toggle-inset-arrow-bottom'});
            bottom_img.click( function() {
                collapse(toggle_inset_arrow);
            });
            inset_div.append(bottom_img);

            content_div.hide(); // We want to animate it, so we have to hide it first
            inset_div.insertAfter(link);
            addToggleInsetArrows(inset_div);
            updateHrefs(inset_div);
            updateImgs(inset_div);
            content_div.slideDown(500);
        });
    }
}

function addToggleInsetArrows(div) {
    div.find('a').each(function() {
        if($(this).attr('href') != undefined) {
            if (wikilink_pattern.test($(this).attr('href'))) { // only select relative links
                var toggle_inset_arrow = $("<span/>", { 'class': 'toggle-inset-arrow' });
                var closed_img = $("<img/>", { 'src': base_path + '/toggle-inset-arrow-closed.png', 'class': 'closed'});
                var open_img = $("<img/>", { 'src': base_path + '/toggle-inset-arrow-open.png', 'class': 'open'});
                open_img.hide();
                toggle_inset_arrow.append(closed_img);
                toggle_inset_arrow.append(open_img);
            	$(this).before(toggle_inset_arrow);
            }
        }
    });
}

function updateHrefs(div) {
    div.find('a').each(function() {
        if($(this).attr('href') != undefined) {
            if (wikilink_pattern.test($(this).attr('href'))) { // only select relative links
                var link = $(this);
                var link_href = link.attr('href');

                // Get the parent's href to construct the proper link
                var enclosing_href = link.closest('div.inset').prev().attr('href');
                link.attr('href', enclosing_href + link_href);
            }
        }
    });
}

function updateImgs(div) {
    div.find('img').each(function() {
        var img = $(this);
        if($(this).attr('src') != undefined) {
            var img_src = img.attr('src');
            if (rel_img_pattern.test(img_src)) { // only select relative images
                // Don't process any absolute paths -- I can't get the RegEx to handle this for some reason.
                if (img_src[0] != '/') {
                    // Get the parent's href to construct the proper link
                    var enclosing_href = img.closest('div.inset').prev().attr('href');
                    var new_img = $("<img/>", { 'src': enclosing_href + img_src });
                    img.after(new_img);
                    img.remove();
                }
            }
        }
    });
}
