const puppeteer = require("puppeteer-extra");
const got = require('got');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function launch(website, debug = False){
    let params;
    if(debug){
        params = {
            headless: false,
            slowMo: 200
        }
    }else{
        params = {
            headless: true
        }
    }
    const browser = await puppeteer.launch(params);
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1920,
      height: 1080
    });
   
    await page.goto(website);

    return page;
}

async function parentPortalLogin(page, email, password){

}
async function googleLogin(page, email, password){
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="email"]', email);
    
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', password);
    
    await page.keyboard.press('Enter');
     
    await page.waitForFunction(() => location.href === "https://app3.ecolecatholique.ca/sp/parent/portail_parent/main.htm")
}

async function get(uri, headers, callback){
    await got.get(uri, {headers: headers, responseType: 'text'}).then(res => callback(res));
}

module.exports.launch = launch;
module.exports.googleLogin = googleLogin;
module.exports.get = get;