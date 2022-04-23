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

async function googleLogin(page, email, password){
    const [newPage] = await Promise.all([
        new Promise(resolve => page.once('popup', resolve)),
        page.click('[target="_blank"]'),
    ]);
     
    await newPage.waitForSelector('input[type="email"]');
    await newPage.type('input[type="email"]', email);
    await newPage.keyboard.press('Enter');
     
    await Promise.all([
        newPage.waitForNavigation(),
        await newPage.waitForSelector('input[type="password"]', { visible: true }),
        await newPage.type('input[type="password"]', password)
    ]);
     
    await Promise.all([
        newPage.waitForFunction(() => location.href === "https://app3.ecolecatholique.ca/sp/parent/portail_parent/main.htm"),
        await newPage.keyboard.press('Enter')
    ]);
    
    return newPage;
}

async function get(uri, headers, callback){
    await got.get(uri, {headers: headers, responseType: 'text'}).then(res => callback(res));
}

module.exports.launch = launch;
module.exports.googleLogin = googleLogin;
module.exports.get = get;