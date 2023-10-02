# lpt-spa-vjs

Laminated Plate Theory in a SPA using vanilla Javascript

Deploy:  git push github-pages main

Development Repo: git push origin main

Update to latest: Solution 1: no conflicts with new-online version
        git fetch origin
        git status, will report something like: Your branch is behind 'origin/master' by 1 commit, and can be fast-forwarded.
        Then get the latest version
        git pull

Uses:
- a dead-simple hash based router
- string template literals for html templating
- some stuff from others that I'll have to give credit for:

cleanHTML.js - Sanitize an HTML string:  * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com

Lodash https://lodash.com/
Copyright JS Foundation and other contributors <https://js.foundation/>
Released under MIT license <https://lodash.com/license>
Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors

Guidance on a router: 
Marc van Neerven - https://javascript.plainenglish.io/a-spa-pwa-router-in-pure-vanilla-es6-javascript-e8f79cfd0111
