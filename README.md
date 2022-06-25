# GradeChecker

A simple tool written with node.js and a headless chromium library, puppeteer, that scans for new grades on my personal school website.

This tool visits my personal school portal, logs-in with Google via automated button clicks, provided by the puppeteer library, and sends HTTP GET requests to each PDF file to see if grades are up.

This is currently running on my Ubuntu Server on a spare laptop, automatically running every hour or two depening on the time of day. At 7PM this server goes into a low-power state to avoid high power usage, and wakes up at 6AM.

## How it works
1. Vists my school portal
2. Logs-in via google, using email + password (https provided by puppeteer)
3. Goes into the grade result section, grading each PDF URI from each <a> link using puppeteer's built-in jquery.
4. Automatically sends a HTTP GET request to each of these URI's, to get a responce
5. The bot simply checks for a header to change, Content-Length, which signals the PDF had been altered, and that a new grade is available.
6. The bot sends the news that the grade is available via webhooks in both google chat and discord.
(6.a The bot only alerts via mention the people who have the corresponding subject.)
7. The bot writes this to a file named `pdf-lengths.txt` to read once the bot restarts.
8. The bot repeats steps 4-7 until it shuts down for the night.
  
## Extra
This repo also has an additional file, called `get_schedule.js`, which grabs my schedule and posts it on google chat via webhook   

## Screenshots
[Bot running in terminal](/terminal.png)
  
[Google Chat Alert via Webhook](/google_chat_alert.png) 
  
[Discord Alert via Webhook](/discord_alert.png) 
