This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Getting Started

You can run various npm scripts to use the app

```bash
npm run dev
## You must run npm build before running npm start
npm run build
npm run start

npm lint
```
## Accessing the page
Open [http://localhost:9930](http://localhost:9930) with your browser to see the result.

To view the page on another device, use the IP of the device hosting the page and use port 9930. For example: http://{Device IP}:9930

# Live Dashboard Features

## Matchup view ("Show Matchup" on the setup page)
* Shows the teams on both the Red and Blue Alliances, thier robot image, team icon and the following stats:
    * Rank
    * Rank points
    * Record (Win-Loss-Tie)

## Alliance View ("Blue Alliance or Red Alliance on the setup page)
* Shows the teams on either the Red or blue alliance, displaying team number, name, and the following stats:
    * Record (Win-Loss-Tie)
    * Ranking 
    * Team Location
    * Robot Name

## Robot View (Click on individual robot numbers on the setup page)
* Shows the Team number and name along with the following:
    * Record (Win-Loss-Tie)
    * Rank
    * Team Location
    * Robot name
    * Notes (notable events that have occured in the season for this team)
    * Upcoming Matches (the next 5 matches)

## Rankings (Show rankings on the setup page)
* This page shows the following:
    * Rank
    * Team Number
    * Team Name
    * Record
    * Ranking Score
    * Average Coop points
    * Average match points
    * Average auto points
    * Average barge points