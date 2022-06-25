//todo: cleanup

// ----- Libraries + Setup -----
const setup = require('./setup.js');
const https = require('https')
const fs = require('fs')

const moment = require('moment');
 

const website = "https://app3.ecolecatholique.ca/sp/parent/portail_parent/espaceEleve.htm";

// People to alert (on discord) and subjects
const pings = [["<@!880428502371938316>"], ["@everyone"], ["<@!880428502371938316>"], ["<@!880428502371938316>"]]
const listSubjects = ["Stats", "Chemistry", "Computer Science", "French"];

// Save pdf content-lengths so we can use them later.
const listPdfLengths = fs.readFileSync("pdf-lengths.txt", 'utf8').split(",");

const secrets = fs.readFileSync("secrets.txt", "utf8").split(",");


//Wether to alert on discord and google chat regardless of new grades available.
const logIfNoGrades = false;

// Wether to log grades if they are available on the first check.
let ignoreFirst = process.argv[2] == "yes";

console.log(`Ignore first grades: ${ignoreFirst}`);

// ----- Program start -----
(async () => {
  const portalPage = await setup.launch(website, false);
  console.log("Launched puppeteer");

  await setup.parentPortalLogin(portalPage, secrets[0], secrets[1]);
  console.log("Logged-in to google");
   
  //Click on the button for grade results
  await portalPage.waitForSelector('button[data-targetpage="pageBulletin"]', { visible: true });
  await portalPage.evaluate(() => {
    document.querySelector('button[data-targetpage="pageBulletin"]').click();
  });
 
  await portalPage.waitForSelector('[id="pageBulletin"]', { visible: true });
  console.log("At grade section");


  checkGradesRecursively(page, 1000);
})();

function checkGradesRecursively(page, amount){
  setTimeout((async () => {
    await getGrades(page);

    let currentHour = moment().hours();
    
    if(currentHour == 20){
      process.exit();
    }else{
      let hoursToWait;

      // Simple calculation depending on time of day (UTC time)  
      // If bot should wait 1 or 2 hours before checking again.
      if (currentHour < 14){
        hoursToWait = 2;
      }else if(currentHour >= 14 && currentHour <= 8){
        hoursToWait = 1;
      }else{
        hoursToWait = 4;
      }
      
  
      checkGradesRecursively(page, hoursToWait * 60 * 60 * 1000);
    }
  }), amount);
}

async function getGrades(page){
  console.log("Checking grades...")

  const selectors = await page.$$("#wrapper > #pageBulletin > #table_courses > #bulletin-container > table > tbody > tr > td > a");
  let googleChatMessage = "", discordMessage = "";

  for (let i = 0; i < selectors.length; i++){
    let element = selectors[i];

    let obj = await element.getProperty('outerHTML');
    let outerHTML = obj._remoteObject.value;

    let uri = outerHTML.split(`'`)[1].replace(/amp;/g,"");
    let sessionId = uri.split("sessionId=")[1].substring(0, 24);

    let newMessage = await checkGrade(uri, sessionId, i, googleChatMessage, discordMessage)
    googleChatMessage = newMessage[0];
    discordMessage = newMessage[1];
  }
  fs.writeFileSync('pdf-lengths.txt', listPdfLengths.toString());

  if (!ignoreFirst){
    if (googleChatMessage != "") sendToGoogleChat(googleChatMessage);
    if (discordMessage != "") sendToDiscord(discordMessage);
  }else{
    ignoreFirst = false;
  }
}

async function checkGrade(uri, sessionId, index, googleChatMessage, discordMessage){
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cookie': `ASP.NET_SessionId=${sessionId}`
  }

  await setup.get(uri, headers, (res) => {
    let pdfLength = res.headers['content-length'].toString();

    if (pdfLength != listPdfLengths[index]){
      listPdfLengths[index] = pdfLength

      googleChatMessage += `NEW Grades up for: ${listSubjects[index]}\n`;
      discordMessage += `${pings[index].toString()} NEW Grades up for: ${listSubjects[index]}\n`;

      console.log(`NEW Grades up for: ${listSubjects[index]}`)

    }else if (pdfLength == listPdfLengths[index]){

      if (logIfNoGrades){
        googleChatMessage += `No new grades up for: ${listSubjects[index]}\n`;
        discordMessage += `${pings[index].toString()} No new grades up for: ${listSubjects[index]}\n`;
      }
      console.log(`No new grades up for: ${listSubjects[index]}`)
    }
  });

  return [googleChatMessage, discordMessage]
}


function sendToGoogleChat(message){
  let webhookPath = secrets[2];
  sendHttpRequest('chat.googleapis.com', webhookPath, 'POST', JSON.stringify({'text': message}), "application/json; charset=UTF-8")
}

function sendToDiscord(message){
  let webhookPath = secrets[3];
  sendHttpRequest('discord.com', webhookPath, 'POST', JSON.stringify({'content': message}), "application/json")
}

function sendHttpRequest(hostname, path, method, payload, contentType = "application/json"){
  const options = {
    hostname: hostname,
    path : path,
    headers: {
      'Content-Type': contentType
    },
    method: method
  }
  
  const req = https.request(options);
  
  req.on('error', error => {
    console.error(error)
  })
  
  req.write(payload)
  req.end()
}