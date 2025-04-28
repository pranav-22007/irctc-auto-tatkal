import "cypress-real-events/support";
let username = Cypress.env("USERNAME");
let password = Cypress.env("PASSWORD");
import {
  PASSENGER_DETAILS,
  SOURCE_STATION,
  DESTINATION_STATION,
  TRAIN_NO,
  TRAIN_COACH,
  TRAVEL_DATE,
  TATKAL,
  PREMIUM_TATKAL,
  BOARDING_STATION,
  UPI_ID_CONFIG,
} from "../fixtures/passenger_data.json";

// Configure uncaught exception handling
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

// Configure request interception to remove Cypress headers
Cypress.on("window:before:load", (win) => {
  delete win.navigator.__proto__.webdriver;
});

describe("IRCTC TATKAL BOOKING", () => {
  before(() => {
    // Clear all existing sessions and storage
    Cypress.session.clearAllSavedSessions();
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("Tatkal Booking Begins......", () => {
    // Validate configuration
    if (TATKAL && PREMIUM_TATKAL) {
      expect(
        false,
        "Make Sure Either TATKAL or PREMIUM TATKAL is True. Not BOTH"
      ).to.be.true;
    }

    // Configure browser-like environment
    cy.viewport(1478, 1056);

    // Intercept all requests to add the required headers
    cy.intercept("*", (req) => {
      delete req.headers["x-cypress-request"];
      delete req.headers["x-cypress-version"];
      delete req.headers["x-cypress-url"];
      req.headers["accept-language"] = "en-US,en;q=0.9";
      req.headers["sec-fetch-dest"] = "document";
      req.headers["sec-fetch-mode"] = "navigate";
      req.headers["sec-fetch-site"] = "same-origin";
      req.headers["bmirak"] = "webbm";
      req.headers["bmiyek"] = "815CF50C4487BD4863911B8D2AA83671";
      req.headers["sec-ch-ua"] =
        '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"';
      req.headers["sec-ch-ua-mobile"] = "?0";
      req.headers["sec-ch-ua-platform"] = '"Windows"';
    });

    // Specific intercept for the auth endpoint
    cy.intercept(
      "POST",
      "https://www.irctc.co.in/authprovider/webtoken",
      (req) => {
        req.headers["bmirak"] = "webbm";
        req.headers["bmiyek"] = "815CF50C4487BD4863911B8D2AA83671";
        req.headers["sec-ch-ua"] =
          '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"';
        req.headers["sec-ch-ua-mobile"] = "?0";
        req.headers["sec-ch-ua-platform"] = '"Windows"';
        req.headers["accept"] = "application/json, text/plain, */*";
        req.headers["content-type"] = "application/x-www-form-urlencoded";
      }
    ).as("authRequest");

    // Visit with stealth configuration
    cy.visit("https://www.irctc.co.in/nget/train-search", {
      failOnStatusCode: false,
      timeout: 90000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Accept-Encoding": "gzip, deflate, br",
        bmirak: "webbm",
        bmiyek: "815CF50C4487BD4863911B8D2AA83671",
      },
      onBeforeLoad(win) {
        // Modify navigator properties to appear as regular browser
        Object.defineProperty(win.navigator, "webdriver", { get: () => false });
        Object.defineProperty(win.navigator, "plugins", {
          get: () => [1, 2, 3, 4, 5],
          configurable: true,
        });
        Object.defineProperty(win.navigator, "languages", {
          get: () => ["en-US", "en"],
          configurable: true,
        });
      },
    });

    // Add a small delay to ensure page is fully loaded
    cy.wait(2000);

    cy.task("log", `Website Fetching completed.........`);
    const UPI_ID = Cypress.env().UPI_ID ? Cypress.env().UPI_ID : UPI_ID_CONFIG;
    const upiRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.]+$/;
    const isValidUpiId = upiRegex.test(UPI_ID);

    // Use real events for more natural interactions
    cy.get(".h_head1 > .search_btn").realClick();

    // Login with randomized typing
    cy.get('input[placeholder="User Name"]').then(($el) => {
      cy.wrap($el)
        .clear()
        .type(username, { delay: 50 + Math.random() * 100 });
    });
    cy.get('input[placeholder="Password"]').then(($el) => {
      cy.wrap($el)
        .clear()
        .type(password, { delay: 50 + Math.random() * 100 });
    });

    // Submitting captcha block starts........
    cy.submitCaptcha().then(() => {
      // closing the last transaction details
      cy.get("body").then((el) => {
        if (el[0].innerText.includes("Your Last Transaction")) {
          cy.get(
            ".ui-dialog-footer > .ng-tns-c19-3 > .text-center > .btn"
          ).realClick();
        }
      });

      // from station with realistic delays
      cy.get(".ui-autocomplete > .ng-tns-c57-8")
        .should("be.visible")
        .type(SOURCE_STATION, { delay: 100 + Math.random() * 500 });
      cy.get("#p-highlighted-option").should("be.visible").realClick();

      // to station
      cy.get(".ui-autocomplete > .ng-tns-c57-9")
        .should("be.visible")
        .type(DESTINATION_STATION, { delay: 100 + Math.random() * 500 });
      cy.get("#p-highlighted-option").should("be.visible").realClick();

      // date with realistic interaction
      cy.get(".ui-calendar").should("be.visible").realClick();
      cy.focused().clear();
      cy.get(".ui-calendar").type(TRAVEL_DATE, { delay: 100 });

      // TATKAL or NORMAL BOOKING
      if (TATKAL) {
        cy.get("#journeyQuota > .ui-dropdown").realClick();
        cy.get(":nth-child(6) > .ui-dropdown-item").realClick();
      }

      if (PREMIUM_TATKAL) {
        cy.get("#journeyQuota > .ui-dropdown").realClick();
        cy.get(":nth-child(7) > .ui-dropdown-item").realClick();
      }

      // search button with random delay
      cy.wait(500 + Math.random() * 1000);
      cy.get(".col-md-3 > .search_btn").realClick();

      // iterating each div block to find our train div block starts.....
      cy.get(":nth-child(n) > .bull-back").each((div, index) => {
        if (
          div[0].innerText.includes(TRAIN_NO) &&
          div[0].innerText.includes(TRAIN_COACH)
        ) {
          cy.bookUntilTatkalGetsOpen(
            div,
            TRAIN_COACH,
            TRAVEL_DATE,
            TRAIN_NO,
            TATKAL
          ).then(() => {
            cy.task("log", "TATKAL TIME STARTED......");
          });

          cy.get(".dull-back.train-Header");
          cy.get(".fill > :nth-child(2)").realClick();

          // Passenger addition with realistic delays
          for (let i = 0; i < PASSENGER_DETAILS.length; i++) {
            if (i > 0) {
              cy.wait(300 + Math.random() * 700);
              cy.get(".pull-left > a > :nth-child(1)").realClick();
            }
          }

          // BOARDING STATION CHANGE
          if (BOARDING_STATION) {
            cy.get(".ui-dropdown.ui-widget.ui-corner-all").realClick();
            cy.contains("li.ui-dropdown-item", BOARDING_STATION).then((li) => {
              cy.wrap(li).realClick();
            });
          }

          // Passenger details filling with realistic typing
          cy.get(".ui-autocomplete input").each((inputField, index) => {
            if (PASSENGER_DETAILS && index < PASSENGER_DETAILS.length) {
              let PASSENGER = PASSENGER_DETAILS[index];
              if (PASSENGER && PASSENGER["NAME"]) {
                cy.wrap(inputField)
                  .clear()
                  .type(PASSENGER["NAME"], {
                    delay: 50 + Math.random() * 100,
                  });
              }
            }
          });

          // AGE with realistic interaction
          cy.get('input[formcontrolname="passengerAge"]').each(
            (inputDiv, index) => {
              cy.wrap(inputDiv).realClick();
              cy.wrap(inputDiv).focused().clear();
              let PASSENGER = PASSENGER_DETAILS[index];
              cy.wrap(inputDiv)
                .invoke("val", PASSENGER["AGE"])
                .trigger("input", { delay: 50 });
            }
          );

          // GENDER with realistic interaction
          cy.get('select[formcontrolname="passengerGender"]').each(
            (inputDiv, index) => {
              let PASSENGER = PASSENGER_DETAILS[index];
              cy.wrap(inputDiv).select(PASSENGER["GENDER"], { force: true });
            }
          );

          // SEAT with realistic interaction
          cy.get('select[formcontrolname="passengerBerthChoice"]').each(
            (inputDiv, index) => {
              let PASSENGER = PASSENGER_DETAILS[index];
              cy.wrap(inputDiv).select(PASSENGER["SEAT"], { force: true });
            }
          );

          // FOOD with realistic interaction
          cy.get("body").then((body) => {
            if (
              body.find('select[formcontrolname="passengerFoodChoice"]')
                .length > 0
            ) {
              cy.get('select[formcontrolname="passengerFoodChoice"]').each(
                (inputDiv, index) => {
                  let PASSENGER = PASSENGER_DETAILS[index];
                  cy.wrap(inputDiv).select(PASSENGER["FOOD"], { force: true });
                }
              );
            }
          });

          // Book only if confirm berths are allotted
          cy.get("body").then((el) => {
            if (
              el[0].innerText.includes(
                "Book only if confirm berths are allotted"
              )
            ) {
              cy.get(":nth-child(2) > .css-label_c").realClick();
            }
            if (el[0].innerText.includes("Consider for Auto Upgradation.")) {
              cy.contains("Consider for Auto Upgradation.").realClick();
            }
          });

          // Payment selection with realistic delay
          cy.wait(500 + Math.random() * 1000);
          cy.get("#\\32  > .ui-radiobutton > .ui-radiobutton-box").realClick();
          cy.get(".train_Search").realClick();

          // Confirmation dialog handling
          cy.get("body").then((el) => {
            if (el[0].innerText.includes("Confirmation")) {
              cy.get('[icon="fa fa-close"] > .ui-button-text').realClick();
            }
          });

          // Second stage captcha
          cy.task(
            "log",
            `.........Solving Second Stage Captchas solveCaptcha()`
          );
          cy.solveCaptcha().then(() => {
            cy.task("log", `Solved Second Stage Captchas solveCaptcha()`);

            // Payment process with realistic delays
            cy.get(":nth-child(3) > .col-pad").realClick();
            cy.wait(300 + Math.random() * 700);
            cy.get(".col-sm-9 > app-bank > #bank-type").realClick();
            cy.get(
              ".col-sm-9 > app-bank > #bank-type > :nth-child(2) > table > tr > :nth-child(1) > .col-lg-12 > .border-all > .col-xs-12 > .col-pad"
            ).realClick();
            cy.get(".btn").realClick();

            // Payment viewport adjustment
            cy.viewport(460, 760);
            cy.intercept("/theia/processTransaction?orderid=*").as("payment");

            cy.wait("@payment", { timeout: 200000 }).then((interception) => {
              if (UPI_ID && isValidUpiId) {
                cy.get("#ptm-upi").realClick();
                cy.get(
                  ".brdr-box > :nth-child(2) > ._1WLd > :nth-child(1) > .xs-hover-box > ._Mzth > .form-ctrl"
                ).type(UPI_ID, {
                  delay: 50 + Math.random() * 100,
                });
                cy.get(":nth-child(5) > section > .btn").realClick();
                cy.wait(120000);
              }
            });
          });
        }
      });
    });
  });
});
