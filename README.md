SpyWatch
========

About
Spy Watch is a privacy extension that aims to create transparency in online internet tracking by third party sites. When a 
user visits a page, Spy Watch lets the user see every site that knows the user visited that page. And for each of these 
sites, the user can find out what other information the site has gathered about the user's browsing history. It can be 
downloaded at https://chrome.google.com/webstore/detail/spy-watch/dflhdldmjlapjlinehkeeopkibefgfkf.

=======
Files:
contentscript.js: Runs everytime the user visits a page. Detects third party spies and loads them into Chrome's storage. 
popup.js: Executes when the user clicks on the popup window. Displays the spies tracking the user. 
manifest.json: Information about the extension including version number, permissions, etc. 
