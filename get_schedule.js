const puppeteer = require('puppeteer-extra');
const moment = require('moment')
const https = require('https')


const webhookURL = 'https://chat.googleapis.com/v1/spaces/AAAAEO1q5Kc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=veKTynSbWICr2Z4iVpNkACHZJ-er-Q9HWWQX2isB--U%3D>';


const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


const website = "https://app3.ecolecatholique.ca/sp/parent/portail_parent/espaceEleve.htm";
const email = "cremax27@ecolecatholique.ca";

const names = ["Maxim"];
const schedules = [["French", "Info", "Stats", "Chemistry"]];

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
 

  await page.setViewport({
    width: 1920,
    height: 1080
  });

  await page.goto(website);
  console.log("Launched puppeteer")


  const [newPage] = await Promise.all([
    new Promise(resolve => page.once('popup', resolve)),
    page.click('[target="_blank"]'),
  ]);

  await newPage.waitForSelector('input[type="email"]')
  await newPage.type('input[type="email"]', "cremax27@ecolecatholique.ca");
  await newPage.keyboard.press('Enter')

  await Promise.all([
    newPage.waitForNavigation(),
    await newPage.waitForSelector('input[type="password"]', { visible: true }),
    await newPage.type('input[type="password"]', "o-G&xIm04_5")
  ]);

  await Promise.all([
    newPage.waitForFunction(() => location.href === 'https://app3.ecolecatholique.ca/sp/parent/portail_parent/main.htm'),
    await newPage.keyboard.press('Enter')
  ]);


  
  await newPage.waitForSelector('button[data-targetpage="pageHoraire"]');
  await newPage.evaluate(() => {
    document.querySelector('button[data-targetpage="pageHoraire"]').click();
  });

  await delay(5000);

  const tommorow = moment().add(1, 'days')
  
  firstElement = tommorow.format("YYYY-MM-DD")
  secondElement = tommorow.format("MM_DD")


  let element = await newPage.$(`#pageHoraire > #table_schedule > #horaire-container > table > tbody > .total_${firstElement} > .boxDate > #j_${secondElement} > div > span`)
  
  let message = "";
  if (element != undefined){
    let elementValue = await element.getProperty('innerText');

    let value = elementValue._remoteObject.value
    message = `Tommorow on ${firstElement} it will be jour ${value}.`

    for (let i = 0; i < schedules.length; i++){
      message += "\n";
      message += `${names[i]}'s schedule for tommorow: ${getSchedule(i, parseInt(value))}`
    }
  }else{
    message = `Tommorow on ${firstElement} it will be a weekend/holiday.`
  }
  
  send(message)
  

  await browser.close();
})();

function getSchedule(index, day){
  schedule = schedules[index];

  if (day == 1){
    return schedule;
  }else if(day == 2){
    return [schedule[1], schedule[0], schedule[3], schedule[2]];
  }else if(day == 3){
    return [schedule[2], schedule[3], schedule[0], schedule[1]];
  }else if(day == 4){
    return [schedule[3], schedule[2], schedule[1], schedule[0]];
  }
}

function send(message){
  const options = {
    hostname: 'chat.googleapis.com',
    path : "/v1/spaces/AAAAEO1q5Kc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=veKTynSbWICr2Z4iVpNkACHZJ-er-Q9HWWQX2isB--U%3D",
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  }
  
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
  
    res.on('data', d => {
      process.stdout.write(d)
    })
  })
  
  req.on('error', error => {
    console.error(error)
  })
  
  req.write(JSON.stringify({'text' : message}))
  req.end()
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}
