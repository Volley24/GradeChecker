const fs = require('fs');
const setup = require('./setup.js');

const secrets = fs.readFileSync("secrets.txt", "utf8").split(",");

const website = "https://app3.ecolecatholique.ca/sp/parent/portail_parent/index.htm";


(async function(){
    const portalPage = await setup.launch(website, true);
    console.log("Launched puppeteer");
  
    await setup.googleLogin(portalPage, secrets[0], secrets[1]);
    console.log("Logged-in to parent portal");

    //Click horaire
    await click(portalPage, 'button[data-targetpage="pageHoraire"]');
    console.log("Clicking horaire");

    //Click the drop down menu thingy
    await click(portalPage, 'select[class="monthDropDown form-control"]');
console.log("drop down thingy");

    //Click the drop down menu thingy
    await click(portalPage, 'option[value="09"]');
console.log("thingy");


    //Grab first 
    const selector = await page.$$("div[id=\"horaire-container\"] > table > tbody > tr")[0];

    //Grab boxes
    const box = await page.$("td", selector)[1];

    let info = getHTMLParamaters(box)['alt'];

    if (info != secrets[4]){
        sendToGoogleChat("This is a test, and it failed.");
    }else{
        sendToGoogleChat("This is a test, and it passed.");
    }

    // Compare first box to current one:
    // If the same: new schedule not up
    // If different: new schedule up !!!

    
    
    // wait for new pages on report card to popup
    const [reportCardPage] = await Promise.all([
        new Promise(resolve => portalPage.once('popup', resolve)),
        portalPage.click('[target="_blank"]'),
    ]);

    let numOfReportCards = await reportCardPage.$$("tbody > tr").length;

    if (numOfReportCards == 10){
        sendToGoogleChat("ur code broke maxim lmao");
    }else{
        sendToGoogleChat("Another test, which passed")
    }
})();

function getHTMLParamaters(htmlObj){
    let paramsObj = {};
    let htmlString = htmlObj.outerHtml;

    let params = htmlString.split(">")[0].split(" ");

    for (let param of params){
        param = param.replace(`"`, "");
        let split = param.split("=")

        paramsObj[split[0]] = split[1];
    }
}

async function click(page, selector){
    await page.waitForSelector(selector);
console.log("awaited selector")
    await page.evaluate(() => {
        document.querySelector(selector).click();
    });
console.log("selected selector")
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
    });
    
    req.write(payload);
    req.end();
}