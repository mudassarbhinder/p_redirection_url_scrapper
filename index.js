const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const express = require("express");
const qs = require("qs");

const proxies = require("./Proxies.json");
let host = proxies[0].host;
let port = proxies[0].port;
let username = proxies[0].username;
let password = proxies[0].password;
const use_proxy = true;

// Set proxies in above variables or import from json

async function get_browser() {
  let config = {
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled=false",
      "--blink-settings=imagesEnabled=false",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--disable-infobars",
      "--window-position=0,0",
      "--ignore-certifcate-errors",
      "--ignore-certifcate-errors-spki-list",
      '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"',
    ],
    ignoreDefaultArgs: ["--enable-automation"],
    excludeSwitches: ["enable-automation"],
    ignoreHTTPSErrors: true,
  };

  if (use_proxy) {
    config.args.push(`--proxy-server=${host}:${port}`);
  }
  const browser = await puppeteer.launch(config);

  return browser;
}

async function get_page(browser) {
  var page = await browser.newPage();
  page.on("dialog", async (dialog) => {
    console.log("Alter Box closed");
    await dialog.dismiss();
  });
  await page.setDefaultTimeout(20 * 1000);
  await page.setDefaultNavigationTimeout(20 * 1000);
  await page.setViewport({ width: 1280, height: 800 });
  //await page.setViewport({ width: 1440, height: 870 });

  return page;
}

async function get_ip(page) {
  let ip = "IP:";

  try {
    await page.goto("https://api.ipify.org/?format=json", {
      waitUntil: "domcontentloaded",
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(500);
    ip =
      "IP:" +
      JSON.parse(
        await page.evaluate(() => {
          return document.querySelector("body>pre").innerText;
        })
      ).ip;
  } catch (error) {
    // console.log(error);
  }

  return ip;
}

async function k2062(req, res) {
  let browser = await get_browser();
  let page = await get_page(browser);
  console.log("/api/k2062", req.query);

  let surl =
    "https://survey.qualtrics.com/jfe/form/SV_3sCRigiMr9Jhd0a?opp=Qual6358-1210-Company-Insights-BX&gc=1&=age&Location=&Wave=Q3%202022&email=&V=D_API&rid=&RISN=&uig=&gid=&sname=&uid=&PID=" +
    req.query.pid +
    "&psid=" +
    req.query.psid +
    "&K2=&med=&id=&ppsid=&vid=&token=&sid=&EOLID=&password=&cintid=&ProjectToken=286ba975-759a-48fc-82a0-d613533ecb8f&job=&custom1=&YGID=&ID=&identifier=&pcid=&sesskey=&zid=&viga=&enc=&table=&tid=&usg=&ClientDuration=60&LS=%7BInvalid%20Expression%7D&wspid=&ss=&ST=&pid=&k2=&spid=&CMRID=&EMI=&ss=&transaction_id=&cmpid=&digid=&orderNumber=ORD-750730-Q6X5&sdv=";
  // console.log(surl);
  try {
    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      const resourceUrl = request.url() + "";
      if (resourceUrl.indexOf("https://dkr1.ssisurveys.com") > -1) {
        try {
          request.respond({ status: 200 });
          // request.abort();
        } catch (error) {}

        return; // prevent calling continue twice
      } else {
        request.continue();
      }
    });
    try {
      await page.authenticate({
        username: username,
        password: password,
      });
      console.log("/api/k2062", req.query, await get_ip(page));
      await page.evaluate((surl) => {
        window.location = surl;
      }, surl);
    } catch (error) {}

    let redir_url = "";

    try {
      await page.waitForXPath(
        "//div[@id='EndOfSurvey']//a[text()='Click here if you are not automatically redirected.']",
        { timeout: 120000 }
      );
      let el = (
        await page.$x(
          "//div[@id='EndOfSurvey']//a[text()='Click here if you are not automatically redirected.']"
        )
      )[0];
      redir_url = await page.evaluate(
        (anchor) => anchor.getAttribute("href"),
        el
      );
    } catch (error) {}

    try {
      console.log({ redirection_url: redir_url });
      res.send({ redirection_url: redir_url });
    } catch (error) {}
  } catch (error) {
    // console.log(error);
  } finally {
    try {
      await browser.close();
    } catch (error) {}
  }
}

async function wix(req, res) {
  let browser = await get_browser();
  let page = await browser.newPage();
  page.on("dialog", async (dialog) => {
    console.log("Alter Box closed");
    await dialog.dismiss();
  });
  await page.setDefaultTimeout(30 * 1000);
  await page.setDefaultNavigationTimeout(30 * 1000);
  await page.setViewport({ width: 1280, height: 800 });
  console.log("/api/wix", req.query);
  let surl =
    "https://online.surveynetwork.com/wix/4/p6845224.aspx?__extsid__=G7CtaTKM%2FMYgmAPZcDQRRw3bd0BtHwdRgDVqsph8aY%2Favr%2Fl1MvwqX819FmpKwBRZroSh5Hf%2BFC7jttr1mxOc7LKmhgfnc7mP%2FFitX0hNuU%3D&PID=" +
    req.query.pid +
    "&psid=" +
    req.query.psid +
    "&subpanelid=179&sc=11&country=27&l=&ORD=ORD-740177-J4P4_2";
  // console.log(surl);
  try {
    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      const resourceUrl = request.url() + "";
      if (resourceUrl.indexOf("https://dkr1.ssisurveys.com") > -1) {
        try {
          try {
            console.log({ redirection_url: resourceUrl });

            res.send({ redirection_url: resourceUrl });
          } catch (error) {
            console.log(error);
          }

          request.abort();
          try {
            await browser.close();
          } catch (error) {}
        } catch (error) {}

        return; // prevent calling continue twice
      } else {
        request.continue();
      }
    });
    try {
      await page.authenticate({
        username: username,
        password: password,
      });
      // console.log("/api/wix", req.query, await get_ip(page));
      console.log("/api/wix", req.query, await get_ip(page));
      await page.goto(surl, {
        // waitUntil: "domcontentloaded",
        waitUntil: "networkidle0",
      });
      await page.waitForTimeout(20000);
    } catch (error) {
      // console.log(error);
    }
  } catch (error) {
    // console.log(error);
  } finally {
    try {
      await browser.close();
    } catch (error) {}
  }
}

async function samplicio2(req, res) {
  let browser = await get_browser();
  let page = await browser.newPage();
  page.on("dialog", async (dialog) => {
    console.log("Alter Box closed");
    await dialog.dismiss();
  });
  await page.setDefaultTimeout(30 * 1000);
  await page.setDefaultNavigationTimeout(30 * 1000);
  await page.setViewport({ width: 1280, height: 800 });

  // await page.waitForTimeout(30000);
  let ssid = req.query.ssid;

  let rvsid = req.query.rvsid;

  let surl = `https://www.surveys.com/start.aspx?SSID=1aa88f70-5896-cec8-895d-364402b0e493&ExtID=${ssid}&IP_FED_PID=D9F8DCC6064266FA1AEECC6A2B29384E&rRespondentID=&rPIMP=27757081&PanelID=677&RoutedSurveyID=${rvsid}&Routed=True&RespondentSource=FED&RouterSupplierID=1336&RouterSupplierName=&Age=25&PostalCode=30309&GENDERID=1&EXTSID=${rvsid}&EXTSupplierSourceID=1336&IP_country=1&IP_Stype=1&ENC=brluJ3veAyH8o8r8dns7dtq0n6w`;
  // console.log(surl);
  try {
    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      const resourceUrl = request.url() + "";
      if (
        resourceUrl.indexOf(
          "https://web70.gfk.com/mrIWeb/mrIWeb.dll?I.Project"
        ) > -1
      ) {
        let mod_url = resourceUrl + "";
        let ret_id = qs.parse(resourceUrl).Id;
        // console.log(mod_url);
        mod_url =
          "https://www.surveys.com/EndSurveyRedirect/return.aspx?SurveyName=USCAUTO202301&ID=xxxxxxxx-xxxx-xIDx-xxxx-xxxxxxxxxxxx&rssc=20&stime=261&sls=&qnum=18&oes=&ENC=rb9kSMWsxQVWoybjSlTBSNTfwZk";
        mod_url = mod_url.replace(
          "&ID=xxxxxxxx-xxxx-xIDx-xxxx-xxxxxxxxxxxx",
          "&ID=" + ret_id
        );

        try {
          request.respond({
            status: 200,
            body: `${mod_url}`,
          });
          // request.abort();
        } catch (error) {}

        return;
      } else if (resourceUrl.indexOf("https://www.samplicio.us/") > -1) {
        try {
          request.respond({
            status: 200,
            body: `${resourceUrl}`,
          });
          // request.abort();
        } catch (error) {}

        return;
      } else {
        request.continue();
      }
    });
    await page.authenticate({
      username: username,
      password: password,
    });
    console.log("/api/samplicio", req.query, await get_ip(page));

    try {
      await page.goto(surl, {
        waitUntil: "domcontentloaded",
        waitUntil: "networkidle0",
      });

      {
        await page.waitForXPath(
          `//*[contains(text(),'https://www.surveys.com/EndSurveyRedirect/return.aspx')]`,
          {
            timeout: 30000,
          }
        );
        let midurl = await page.evaluate((el) => {
          return el.innerText;
        }, (await page.$x(`//*[contains(text(),'https://www.surveys.com/EndSurveyRedirect/return.aspx')]`))[0]);

        try {
          let nurl = midurl;
          await page.goto(nurl, {
            waitUntil: "domcontentloaded",
            waitUntil: "networkidle0",
          });
        } catch (error) {
          console.log(error);
        }
      }

      {
        await page.waitForXPath(
          `//*[contains(text(),'https://www.samplicio.us/')]`,
          {
            timeout: 30000,
          }
        );
        let lasturl = await page.evaluate((el) => {
          return el.innerText;
        }, (await page.$x(`//*[contains(text(),'https://www.samplicio.us/')]`))[0]);
        console.log({ redirection_url: lasturl });
        res.send({ redirection_url: lasturl });
      }

      console.log("/api/samplicio", req.query, await get_ip(page));
    } catch (error) {}
  } catch (error) {
  } finally {
    try {
      await browser.close();
      res.send("NULL");
    } catch (error) {}
  }
}

async function run_server() {
  // let logf = console.log;
  const app = express();
  const port = 8090;

  app.get("/api/k2062", k2062);

  app.get("/api/wix", wix);

  app.get("/api/samplicio", samplicio2);

  app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
  });
}

(async () => {
  await run_server();
})();
