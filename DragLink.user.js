// ==UserScript==
// @name         DragLink
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/DragLink/raw/master/DragLink.user.js
// @version      0.1
// @description  Drag a link upwards to open in a new tab, downwards to open in a background tab.
// @author       LenAnderson
// @match        *://*/*
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    let dist = (GM_getValue('draglink-distance') || 20)*1;
    let dragging = false;
    let start;
    
    function init(root) {
        root = root || document.body;
        
        [].filter.call(root.querySelectorAll('a'), function(a) { return !a.getAttribute('data-draglink') && a.href && a.href.substring(0,11).toLowerCase() != 'javascript:'; }).forEach(function(a) {
            a.addEventListener('dragstart', function(evt) {
                if (dragging) return;
                dragging = true;
                start = {x:evt.screenX, y:evt.screenY};
            });
            a.addEventListener('dragend', function(evt) {
                if (!dragging) return;
                dragging = false;
                let dy = start.y - evt.screenY;
                if (dy >= dist) {
                    GM_openInTab(a.href, false);
                } else if (dy <= -dist) {
                    GM_openInTab(a.href, true);
                }
            });
            a.setAttribute('data-draglink', 1)
        });
    }
    
    GM_registerMenuCommand('[DragLink]  Set Distance', function() {
        let d = prompt("Enter the distance in pixels to drag the link in order to open it.\nCurrent value: " + dist);
        if (d && d*1 > 0) {
            GM_setValue('draglink-distance', d);
            dist = d*1;
        }
    });
    
    init();
    var mo = new MutationObserver(function(muts) {
        muts.forEach(function(mut) {
            [].forEach.call(mut.addedNodes, function(node) {
                if (node instanceof HTMLElement) {
                    init(node);
                }
            });
        });
    });
    mo.observe(document.body, {childList:true, subtree:true});
})();
