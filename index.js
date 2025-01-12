'use strict';
//refernce - https://github.com/anthonysukotjo/google-form-bot
// const puppeteer = require('puppeteer');
import puppeteer from 'puppeteer';
// const userManager = require('./userManager.js');
import User from "./userManager.js"
let userManager = User;

import http from 'http';

const PORT = 3000; //port number the server will listen at

const config = {
  formLink: 'https://docs.google.com/forms/d/e/1FAIpQLSem5p1dFyi_LBewrSftI1r2cpDf20bsqoZ9gx9nE7nyiir22g/viewform?usp=dialog',  //@baltej223
  // formLink: 'https://docs.google.com/forms/d/e/1FAIpQLScN-IndYJtjTEsoAzPzgxqUYwWs4Nbll_wZ0vEoe6xEa1JjBA/viewform?usp=header',
  
  email: 'sarthaktyagi2810@gmail.com',
  monitorInterval: 5000,
  debug: true
};

// post req will look like 
// {"time":"8:00","link":"link","name":"name","email":"email", "group":"group", "rollno":"rollno","cookie":"cookie"}
const server = http.createServer((req, res) => {
  // Check if the request is a POST request to the /submit endpoint
  if (req.method === 'POST' && req.url === '/') {
      let body = '';

      // Collecting data chunks
      req.on('data', chunk => {
          body += chunk.toString();
      });

      // When all data is received
      req.on('end', () => {
          const data = JSON.parse(body);
          // console.log('Received POST data:', data);
          if (data==undefined){
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request');
          }
          console.log("recevied: ",data["time"],data["link"],data["name"],data["email"],data["group"],data["rollno"],data["cookie"]);
          if (data["time"]&&data["link"]&&data["name"]&&data["email"]&&data["group"]&&data["rollno"]&&data["cookie"]&&data["date"]){
            // received data is comp
            let newUser = new userManager(data.time);
            newUser.link(data.link);
            newUser.name(data.name);
            newUser.email(data.email);
            newUser.group(data.group);
            newUser.rollno(data.rollno);
            newUser.cookie(data.cookie);
            newUser.date(data.date)
            newUser.add();
          }
          // Send response back
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Data added Successfully!');
      });
  } else {
      // error
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// I though to put post req handler code and form fill code in diffrent files but this will not allow
// Any intraction between post req handler code and form fill code

// ----- //

// Basically it wont work when there will appear a 
// You will need to signin dialog.
// And this dialog only appears when there is a record this email checkbox option.

async function fillForm() {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage(); // for opening a new page
    console.log("Opening form...");

    await page.goto(config.formLink, { waitUntil: 'networkidle2' });  // for opening some link, untile network in stable
    const title = await page.$eval("title", el => el.textContent); //mdn : This method finds the first element within the page that matches the selector and passes the result as the first argument to the pageFunction.
    console.log("Form opened");
    console.log("Form Title:", title);
    await page.waitForSelector('input.whsOnd.zHQkBf');
    const inputField = await page.$('input.whsOnd.zHQkBf'); // mdn: Finds the first element that matches the selector. If no element matches the selector, the return value resolves to null
    
    if (!inputField) {
      throw new Error('Could not find input field');
    }

    await page.evaluate(el => el.value = '', inputField);  // runs some js in page's context basically will run js as if we run it in console.
    await inputField.type(config.email); // for giving a vibe of manually typing
    console.log("Email entered:", config.email);
    const submitSelectors = [
      'div[role="button"][jsname="M2UYVd"]',
      '.freebirdFormviewerViewNavigationSubmitButton',
      'div[jscontroller="soHxf"][role="button"]',
      '.appsMaterialWizButtonEl',
      '.uArJ5e.UQuaGc.Y5sE8d.VkkpIf.QvWxOd'
    ];
    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        submitButton = await page.$(selector);
        if (submitButton) {
          console.log(`Found submit button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        if (config.debug) {
          console.log(`Submit button selector ${selector} not found`);
        }
      }
    }

    if (!submitButton) {
      console.log("Attempting to find and click Next button...");
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
        const nextButton = buttons.find(button => {
          const text = button.textContent.toLowerCase();
          return text.includes('next') || text.includes('submit') || text.includes('send');
        });
        if (nextButton) nextButton.click();
      });
    } else {
      await submitButton.click();
    }
    try {
      await page.waitForNavigation({ timeout: 5000 });
      const submissionPage = await page.url();
      if (submissionPage.includes("formResponse")) {
        console.log("Form Submitted Successfully!");
      }
    } catch (e) {
      console.log("Navigation after submit didn't complete, but form might still be submitted");
    }

    await page.close();
    await browser.close();

  } catch (error) {
    console.error("Error:", error.message);
    if (browser) {
      await browser.close();
    }
  }
}




async function monitorAndFill() {
  console.log("Starting form monitor...");
  console.log(`Will attempt to fill form with email: ${config.email}`);
  await fillForm();
  setInterval(async () => {
    try {
      await fillForm();
    } catch (error) {
      console.error("Monitor iteration failed:", error.message);
    }
  }, config.monitorInterval);
}

process.on('SIGINT', () => {
  console.log('\nStopping form monitor...');
  process.exit(0);
});
monitorAndFill().catch(console.error);