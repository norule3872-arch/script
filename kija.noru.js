// ==UserScript==
// @name         kjv popup 
// @namespace    noru
// @version      1.0
// @match        https://kissjav.li/*
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/norule3872-arch/script/refs/heads/main/kija.noru.js
// ==/UserScript==

(function () {
    'use strict';

    const blockedUrls = [
        'tsyndicate.com/api/v1/direct/bf57abd2ecb34326a34db1a8e88e6f30',
        'ethnicexpressions.org/4/4ffb29d9a3e14249b993653a8c94060a'
    ];

    function removeBlockedScripts() {
        document.querySelectorAll('script').forEach(script => {
            const text = script.textContent || '';

            if (blockedUrls.some(url => text.includes(url))) {
                script.remove();
            }
        });
    }

    removeBlockedScripts();

    new MutationObserver(removeBlockedScripts).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
