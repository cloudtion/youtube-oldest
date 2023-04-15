
# Youtube Oldest to Newest

  
This repository contains the source for the website [https://youtubeoldesttonewest.com](https://youtubeoldesttonewest.com).

It is a monorepo containing both a back-end (an Express.js server using Firebase's Realtime Database) and a front-end (A single-page React app).

  
## Prerequisites

This guide assumes that you have [Node.js](https://nodejs.org/) installed and that it is accessible from the command line/terminal. 

## Server Setup
To run the server you'll first need to [create a firebase project](https://firebase.google.com). 

Once you create a new project, go into **Project Settings** > **Service accounts** and click "**Generate Private Key**". A JSON file should begin downloading.

Move the JSON file into the **server** folder, and rename it "firebase-service-account.json".

Create a **Realtime Database** in your firebase project. Choose "Start in Locked" mode if the option appears. Once you create the database, you should be able to view your database's URL. It may look something like this: ` https://[Your project name]-default-rtdb.firebaseio.com`. Copy the URL. 

In the server folder, rename the file **example.env** to just **.env** and paste in your database URL that you just copied, replacing the text "[Your Realtime Database URL]"

Open up the command line/terminal in the **server** folder and run the command`npm install`. When that is finished, you can run the server by running `node .` The server should be running.


## Front-End

In the **front** folder, rename the file **example.env** to just **.env**

Open up the command line/terminal in the **front** folder and run the command`npm install`. When that is finished,  start the development server by running `npm start.` 

The server should be running at [http://localhost:8080](http://localhost:8080)

You can change the port that the development server runs on by changing the port setting in **webpack.config.js** in the **front** folder. *Note that you will also have to change the ` CORS_WHITELIST ` variable in **server** > **.env**