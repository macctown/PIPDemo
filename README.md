# PIPDemo

Steps:
- download/clone project
- go to project folder
- run `npm install`
- make sure your mongodb is running on port: 27017
- run `node server.js`
- visit http://localhost:8080/ and you should be able to see "Crawl Labs" and "Crawl Researchers" buttons
- Click "Crawl Labs" first and refresh page after seen "success" message, then you should be able to see a list of labs
- Click "Crawl Researchers" then and refresh page after seen "success" message, then you should be able to see a list of researchers
- Open detail page of a researcher, and find his profile page on "Google Scholar", paste that url into 'Profile' feild and click "Crawl Papers".
- Refresh that page and you should be able to see a list of the researcher's publications
- *NOTE*: you will get blocked if you crawl publication from google scholar very frequently.
