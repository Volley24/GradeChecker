const setup = require('./setup.js');

const secrets = fs.readFileSync("secrets.txt", "utf8").split(",");

(async function(){
    const portalPage = await setup.launch(website, false);
    console.log("Launched puppeteer");
  
    await setup.parentPortalLogin(portalPage, secrets[0], secrets[1]);
    console.log("Logged-in to parent portal");

    //Click horaire
    await portalPage.waitForSelector('button[data-targetpage="pageHoraire"]', { visible: true });
    await portalPage.evaluate(() => {
        document.querySelector('button[data-targetpage="pageHoraire"]').click();
    });

    //Click the drop down menu thingy
    await portalPage.waitForSelector('select[class="monthDropDown form-control"]', { visible: true });
    await portalPage.evaluate(() => {
        document.querySelector('select[class="monthDropDown form-control"]').click();
    });

    //Click the drop down menu thingy
    await portalPage.waitForSelector('option[value="09"]', { visible: true });
    await portalPage.evaluate(() => {
        document.querySelector('option[value="09"]').click();
    });

    //Grab first 
    const selector = await page.$$("div[id=\"horaire-container\"] > table > tbody > tr")[0];

    


    //select[class=\"monthDropDown form-control\

    await portalPage.click()

    const [reportCardPage] = await Promise.all([
        new Promise(resolve => portalPage.once('popup', resolve)),
        portalPage.click('[target="_blank"]'),
    ]);
});