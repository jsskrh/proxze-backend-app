const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const dotenv = require("dotenv");
// var aws = require("aws-sdk");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
dotenv.config();
var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_BUCKET_REGION });
const { renderFile } = require("ejs");
const { join } = require("path");
const { default: axios } = require("axios");

const createResetMail = ({ firstName, encodedToken, email, resetUrl }) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http:/= /www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      style="background-color: #eaeaea; margin-top: 0; padding: 0; margin: 0"
    >
      <head>
        <meta
          http-equiv="Content-Type"
          content="text/html charset=UTF-=
    8"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scal=
    e=1"
        />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <style type="text/css">
          @media (max-width: 499px) {
            u + .body .inbox-fix,
            u + .body .content-shell-table,
            u + .body .footer-shell-table,
            u + .body .footer {
              min-width: calc(100vw - 8.5vw) !important;
            }
    
            .mobile-hide,
            .ios-hide {
              display: none !important;
            }
    
            .desktop-hide,
            .desktop-hide img {
              display: initial !important;
            }
    
            table.desktop-hide {
              display: table !important;
            }
    
            .mobile-100w {
              width: 100% !important;
            }
    
            .mobile-block {
              display: block !important;
            }
    
            .mobile-center {
              margin: 0 auto;
              text-align: center !important;
            }
    
            .inner-padding {
              padding-left: 6% !important;
              padding-right: 6% !important;
            }
    
            .outside-padding {
              padding-left: 12% !important;
              padding-right: 12% !important;
            }
    
            .content-padding {
              padding-left: 6% !important;
              padding-right: 6% !important;
            }
    
            .desktop-hide-max,
            .desktop-hide-max img {
              display: initial !important;
            }
          }
          @media screen and (-webkit-min-device-pixel-ratio: 0) and (max-width: 499px) {
            .container.main-border {
              padding: 0 !important;
            }
    
            .content-shell {
              border: none !important;
            }
          }
          @media yahoo {
            table {
              border-collapse: collapse;
              table-layout: fixed;
            }
    
            table table {
              table-layout: auto;
            }
          }
          .hide-link a,
          .iosnonlink a,
          .hide-link {
            text-decoration: none !important;
            cursor: text;
          }
          @media screen {
            @font-face {
              font-family: ProxzeSans-Light;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5..100,300;1,62.5..100,300&display=swap");
              font-weight: 300;
            }
    
            @font-face {
              font-family: ProxzeSans-Regular;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth@0,62.5..100;1,62.5..100&display=swap");
              font-weight: 400;
            }
    
            @font-face {
              font-family: ProxzeSans-Medium;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5..100,500;1,62.5..100,500&display=swap");
              font-weight: 700;
            }
    
            @font-face {
              font-family: ProxzeSans-Bold;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5..100,700;1,62.5..100,700&display=swap");
              font-weight: 700;
            }
          }
          @media (max-width: 499px) {
            .color-wrapper {
              width: 100% !important;
            }
          }
          @media (max-width: 499px) {
            .bullet .indent.true {
              width: 8% !important;
            }
    
            .bullet .indent.true {
              padding-left: 3% !important;
            }
    
            .envelope.rtl .bullet .indent.true {
              padding-right: 3% !important;
            }
          }
          @media (max-width: 499px) {
            .bullet-point {
              line-height: 22px !important;
            }
          }
          @media (max-width: 768px) {
            .icon {
              padding-top: 4px !important;
            }
          }
          @media (max-width: 499px) {
            .image .default-image-width img {
              width: 100%;
            }
          }
          @media (max-width: 499px) {
            .mobile-hide-max,
            .ios-hide-max {
              display: none !important;
            }
    
            .inbox-fix {
              display: none;
            }
    
            .desktop-hide-max,
            .desktop-hide-max img {
              display: initial !important;
            }
    
            table.content-shell-table,
            table.footer-shell-table,
            .footer {
              width: 100% !important;
            }
    
            .content {
              width: 100% !important;
            }
          }
          .footer-shell .footer-link {
            line-height: 20px;
          }
          @media (max-width: 500px) {
            .mosaic-module .middle {
              width: 46% !important;
              padding-right: 4% !important;
              padding-left: 4% !important;
            }
    
            .mosaic-module .left,
            .mosaic-module .right {
              width: 24.8% !important;
            }
    
            .mosaic-module .component-image.cell,
            .mosaic-module .single-button .content-padding {
              padding-top: 15px !important;
            }
          }
          @media (max-width: 499px) {
            u + .body .gmail-screen {
              background: #000;
              mix-blend-mode: screen;
            }
    
            u + .body .gmail-difference {
              background: #000;
              mix-blend-mode: difference;
            }
          }
          @media only screen and (max-width: 500px) {
            .main-header-icon-cell {
              width: 12% !important;
            }
    
            .header-copy-cell {
              width: 85% !important;
            }
    
            .header-copy-cell-with-profile-icon {
              width: 78% !important;
            }
    
            .proxze-logo-cell {
              width: 10% !important;
            }
          }
          @media (max-width: 499px) {
            .evidence-cards-component-image-cell {
              width: 12% !important;
            }
          }
          @media (max-width: 499px) {
            .evidence-images img {
              width: 100% !important;
              height: auto !important;
            }
          }
          @media (max-width: 499px) {
            .marker {
              padding: 5px 7px 5px 7px !important;
            }
          }
          @media (max-width: 499px) {
            .evidence-trailer-component-image-cell {
              width: 12% !important;
            }
          }
          @media (max-width: 500px) {
            .button-copy a {
              padding: 13px 0px !important;
              width: 100% !important;
            }
          }
          @media (min-width: 501px) {
            .button-copy a {
              padding: 13px 40px;
            }
          }
          @media (max-width: 499px) {
            .image .default-image-width img {
              width: 100%;
            }
    
            .artwork img {
              width: 100% !important;
            }
    
            .number img {
              width: 100% !important;
            }
          }
          @media (max-width: 499px) {
            .episode-content-cell {
              width: 40% !important;
            }
    
            .episode-content-cell-image {
              width: 100% !important;
              height: auto !important;
            }
    
            .episode-content-cell-progress-bar {
              width: 100% !important;
              height: auto !important;
            }
          }
          @media (max-width: 499px) {
            .exp-img-1 img {
              width: 70% !important;
            }
    
            .exp-img-2 {
              padding-left: 20px !important;
            }
    
            .exp-img-2 img {
              width: 85% !important;
            }
    
            .exp-img-3 img {
              width: 85% !important;
            }
    
            .exp-img-4 img {
              width: 85% !important;
            }
    
            .calendar img {
              width: 85% !important;
              height: auto !important;
            }
          }
          @media (max-width: 499px) {
            .logo-with-horizontal-date-logo-image-cell {
              width: 60% !important;
            }
          }
          @media (max-width: 499px) {
            .thumbs-button-image-width {
              width: 80% !important;
            }
    
            .thumbs-button-cell-spacer {
              width: 6% !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-hero-inner-body-cell {
              width: 88% !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-hero-inner-body-cell {
              width: 88% !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-themed-category-spacer-td {
              height: 12px !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .right-pencil-image img {
              width: 75% !important;
              height: auto !important;
            }
    
            .left-pencil-image img {
              width: 85% !important;
              height: auto !important;
            }
    
            .left-pencil-cell {
              width: 30% !important;
            }
    
            .right-pencil-cell {
              width: 30% !important;
            }
    
            .color-page-cell {
              width: 40% !important;
            }
    
            .printable-logo-image img {
              width: 40% !important;
              height: auto !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-theme-bars-images img {
              width: 100% !important;
              height: auto !important;
            }
          }
          .footer .address .hide-link,
          .footer .address .hide-link a {
            cursor: pointer;
            text-decoration: underline;
          }
        </style>
      </head>
      <body
        class="body"
        style="background-color: #eaeaea; margin-top: 0; padding: 0; margin: 0"
      >
        <table
          width="100%"
          border="0"
          class="envelope account"
          data-testid="envelope"
          cellpadding="0"
          cellspacing="0"
          style="background-color: #eaeaea"
          bgcolor="#eaeaea"
        >
          <tbody>
            <tr>
              <td
                align="center"
                class="container"
                style="background-color: #eaeaea; margin-top: 0"
                bgcolor="#eaeaea"
              >
                <table
                  align="center"
                  border="0"
                  class="content"
                  cellpadding="0"
                  cellspacing="0"
                  style="background-color: #ffffff; width: 500px"
                  width="500"
                  bgcolor="#ffffff"
                >
                  <tbody>
                    <tr>
                      <td align="center" class="shell">
                        <a
                          href="${process.env.CLIENT_URL}"
                          class="disabled-plaintext"
                          data-testid="logo"
                          style="color: inherit"
                          ><table
                            class="logo image"
                            width="100%"
                            data-testid="image"
                            cellpadding="0"
                            cellspacing="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="cell logo content-padding"
                                  align="left"
                                  style="
                                    padding-left: 40px;
                                    padding-right: 40px;
                                    padding-top: 20px;
                                  "
                                >
                                  <img
                                    src="https://res.cloudinary.com/jsskrh/image/upload/v1707051577/sage-grey/proxze/hoay5yb9baupjoohbhth.png"
                                    alt="Proxze"
                                    width="120"
                                    border="0"
                                    class="undefined"
                                    style="
                                      -ms-interpolation-mode: bicubic;
                                      border: none;
                                      outline: none;
                                      border-collapse: collapse;
                                      display: block;
                                      border-style: none;
                                    "
                                  />
                                </td>
                              </tr>
                            </tbody></table
                        ></a>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy h1 content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Bold, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 700;
                                  font-size: 36px;
                                  line-height: 43px;
                                  letter-spacing: -1px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                Welcome to Proxze
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                Hi
                                <span
                                  class="break-word"
                                  style="word-break: break-all"
                                  >${firstName}</span
                                >,
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                You&#x27;re almost set. Please
                                click on the button below to reset your password.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          class="single-button mobile-100w"
                          align="center"
                          width="100%"
                          data-testid="single-button"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="content-padding"
                                align="center"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  padding-top: 20px;
                                "
                              >
                                <table
                                  class="inner-button border-false"
                                  style="
                                    background-color: #38a139;
                                    border-radius: 4px;
                                    width: 100%;
                                  "
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  bgcolor="#38a139"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="h5 button-td"
                                        align="center"
                                        style="
                                          font-family: ProxzeSans-Bold, Helvetica,
                                            Roboto, Segoe UI, sans-serif;
                                          font-weight: 700;
                                          font-size: 14px;
                                          line-height: 17px;
                                          letter-spacing: -0.2px;
                                          padding-top: 20px;
                                          padding: 14px 40px;
                                          color: #ffffff;
                                        "
                                      >
                                        <a
                                          class="h5"
                                          href=${resetUrl}
                                          style="
                                            font-family: ProxzeSans-Bold, Helvetica,
                                              Roboto, Segoe UI, sans-serif;
                                            font-weight: 700;
                                            font-size: 14px;
                                            line-height: 17px;
                                            letter-spacing: -0.2px;
                                            text-align: center;
                                            text-decoration: none;
                                            display: block;
                                            color: #ffffff;
                                          "
                                          >Reset password</a
                                        >
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          width="100%"
                          class="spacer-table"
                          data-testid="spacer"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="spacer"
                                style="font-size: 0; line-height: 0; height: 20px"
                                height="20"
                              >
                                =C2=A0
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                If that doesn&#x27;t work, copy and paste the
                                following link in your browser:<br />
                                <a
                                  href=${resetUrl}
                                  style="color: inherit; text-decoration: underline"
                                  >${resetUrl}</a
                                >
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                We&#x27;re here to help if you need it. Contact the support team at 
                                <a
                                  href="mailto:support@proxze.com"
                                  style="color: inherit; text-decoration: underline"
                                  >support@proxze.com</a
                                >
                                and
                                <a
                                  href="tel:+23402018870030"
                                  style="color: inherit; text-decoration: underline"
                                  >+23402018870030</a
                                >.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy h5 medium content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-size: 14px;
                                  line-height: 17px;
                                  letter-spacing: -0.2px;
                                  font-family: ProxzeSans-Medium, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 700;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                The Proxze team
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          width="100%"
                          data-testid="divider"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="divider content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  padding-top: 30px;
                                "
                              >
                                <table
                                  align="center"
                                  width="100%"
                                  cellpadding="0"
                                  cellspacing="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="empty divider-border"
                                        style="
                                          font-size: 0;
                                          line-height: 0;
                                          border-style: solid;
                                          border-bottom-width: 0;
                                          border-color: #221f1f;
                                          border-top-width: 2px;
                                        "
                                      >
                                        =C2=A0
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          class="single-button mobile-100w"
                          align="center"
                          width="100%"
                          data-testid="single-button"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  padding-top: 30px;
                                "
                                align="center"
                              >
                                <table
                                  class="inner-button border-true"
                                  style="
                                    border-width: 2px;
                                    border-style: solid;
                                    border-radius: 4px;
                                    border-color: #000000;
                                    background-color: #ffffff;
                                    width: 100%;
                                  "
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  bgcolor="#FFFFFF"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="h5 button-td"
                                        style="
                                          font-family: ProxzeSans-Bold, Helvetica,
                                            Roboto, Segoe UI, sans-serif;
                                          font-weight: 700;
                                          font-size: 14px;
                                          line-height: 17px;
                                          letter-spacing: -0.2px;
                                          padding-top: 20px;
                                          padding: 14px 40px;
                                          color: #000000;
                                        "
                                        align="center"
                                      >
                                        <a
                                          class="h5"
                                          href="${process.env.CLIENT_URL}"
                                          style="
                                            font-family: ProxzeSans-Bold, Helvetica,
                                              Roboto, Segoe UI, sans-serif;
                                            font-weight: 700;
                                            font-size: 14px;
                                            line-height: 17px;
                                            letter-spacing: -0.2px;
                                            text-align: center;
                                            text-decoration: none;
                                            display: block;
                                            color: #000000;
                                          "
                                          >Visit Proxze</a
                                        >
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        class="footer-shell"
                        style="background-color: #ffffff"
                        bgcolor="#ffffff"
                      >
                        <table
                          class="footer"
                          width="100%"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="center"
                                valign="top"
                                class="footer-shell content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  background-color: #ffffff;
                                "
                                bgcolor="#ffffff"
                              >
                                <table
                                  width="100%"
                                  class="spacer-table"
                                  data-testid="spacer"
                                  cellpadding="0"
                                  cellspacing="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="spacer"
                                        style="
                                          font-size: 0;
                                          line-height: 0;
                                          height: 40px;
                                        "
                                        height="40"
                                      >
                                        =C2=A0
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        class="footer-icon-wrapper"
                                        style="padding: 0 20px 0 0"
                                      >
                                        <table
                                          class="component-image image"
                                          width="100%"
                                          data-testid="image"
                                          cellpadding="0"
                                          cellspacing="0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                class="cell component-image none"
                                                align="center"
                                                style="padding-top: 0"
                                              >
                                                <img
                                                  src="https://res.cloudinary.com/jsskrh/image/upload/v1707051577/sage-grey/proxze/hoay5yb9baupjoohbhth.png"
                                                  alt
                                                  width="50"
                                                  border="0"
                                                  class="undefined"
                                                  style="
                                                    -ms-interpolation-mode: bicubic;
                                                    border: none;
                                                    outline: none;
                                                    border-collapse: collapse;
                                                    display: block;
                                                  "
                                                />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td valign="top" class="footer-copy-wrapper">
                                        <table
                                          class="footer-table"
                                          width="100%"
                                          valign="top"
                                          cellpadding="0"
                                          cellspacing="0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td class="footer-copy-shell">
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy legal-top"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy legal none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          letter-spacing: -0.1px;
                                                          color: #a4a4a4;
                                                          font-size: 15px;
                                                          line-height: 19px;
                                                          padding-top: 0;
                                                        "
                                                      >
                                                        <span
                                                          class="dark-legal"
                                                          style="color: #4d4d4d"
                                                          >By joining Proxze,
                                                          you&#x27;ve agreed to our
                                                          <a
                                                            href="${process.env.CLIENT_URL}/terms-of-service"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Terms of Service</a
                                                          >
                                                          and
                                                          <a
                                                            href="${process.env.CLIENT_URL}/privacy-policy"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Privacy Statement</a
                                                          >.<br /><br />Please
                                                          review the
                                                          <a
                                                            href="${process.env.CLIENT_URL}/privacy-policy"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Privacy Statement</a
                                                          >
                                                          to learn how we use your
                                                          personal information, and
                                                          go to your
                                                          <a
                                                            href="${process.env.CLIENT_URL}/settings/contact-info"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Account Settings</a
                                                          >
                                                          for more details about
                                                          related features.
                                                        </span>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  width="100%"
                                                  class="spacer-table"
                                                  data-testid="spacer"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        class="spacer"
                                                        style="
                                                          font-size: 0;
                                                          line-height: 0;
                                                          height: 20px;
                                                        "
                                                        height="20"
                                                      >
                                                        =C2=A0
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy p1 none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 14px;
                                                          line-height: 18px;
                                                          letter-spacing: -0.25px;
                                                          color: #a4a4a4;
                                                          padding-top: 0;
                                                        "
                                                      >
                                                        <span class="ignore-diff"
                                                          >Questions? Contact support
                                                          </span
                                                        >
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy address"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy legal none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 11px;
                                                          line-height: 14px;
                                                          letter-spacing: -0.1px;
                                                          color: #a4a4a4;
                                                          padding-top: 0;
                                                        "
                                                      >
                                                        <span
                                                          class="hide-link"
                                                          style="
                                                            cursor: pointer;
                                                            text-decoration: none;
                                                          "
                                                          ><a
                                                            href="${process.env.CLIENT_URL}"
                                                            style="
                                                              color: #a4a4a4;
                                                              cursor: pointer;
                                                              text-decoration: none;
                                                            "
                                                            >MyProxze Limited</a
                                                          ></span
                                                        >
                                                      </td>
                                                    </tr>
                                                    =
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table"
                                                  ="data-testid"
                                                  ="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        ali="gn"
                                                        ="left"
                                                        class="copy p2 none"
                                                        style="
                                                          font-family: ProxzeSans-Regula=
                                                              r,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 12= px;
                                                          line-height: 15px;
                                                          letter-spacing: -0.12px;
                                                          padding-top: 20px;
                                                          color: #a9a6a6;
                                                        "
                                                      >
                                                        <a
                                                          class="footer-link"
                                                          href="${process.env.CLIENT_URL}/settings/notification"
                                                          styl="e"
                                                          ="text-decoration: underline; line-height: 20px; color: #a4a4a4;"
                                                          >Notification Settings</a
                                                        ><br /><a
                                                          class="footer-link"
                                                          href="${process.env.CLIENT_URL}/terms-of-service"
                                                          style="
                                                            text-decoration: underline;
                                                            line-height: 20px;
                                                            color: #a4a4a4;
                                                          "
                                                          >Terms of Service</a
                                                        ><br /><a
                                                          class="footer-link"
                                                          href="${process.env.CLIENT_URL}/privacy-policy"
                                                          style="
                                                            text-decoration: underline;
                                                            line-height: 20px;
                                                            color: #a4a4a4;
                                                          "
                                                          >Privacy</a
                                                        >
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy legal none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 11px;
                                                          line-height: 14px;
                                                          letter-spacing: -0.1px;
                                                          padding-top: 20px;
                                                          color: #a4a4a4;
                                                        "
                                                      >
                                                        This message was mailed to
                                                        <a
                                                          href="${process.env.CLIENT_URL}"
                                                          class="hide-link ignore-diff"
                                                          style="
                                                            cursor: text;
                                                            color: #a4a4a4;
                                                            text-decoration: none;
                                                          "
                                                          >[${email}]</a
                                                        >
                                                        by Proxze as part of your
                                                        Proxze membership.<br />
                                                      </td>
                                                      <table
                                                        width="100%"
                                                        class="spacer-table"
                                                        data-testid="spacer"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                      >
                                                        <tbody>
                                                          <tr>
                                                            <td
                                                              class="spacer"
                                                              style="
                                                                font-size: 0;
                                                                line-height: 0;
                                                                height: 40px;
                                                              "
                                                              height="40"
                                                            >
                                                              =C2=A0
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
    `;
};

const createVerificationMail = ({
  firstName,
  encodedToken,
  email,
  liveUrl,
}) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http:/= /www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      style="background-color: #eaeaea; margin-top: 0; padding: 0; margin: 0"
    >
      <head>
        <meta
          http-equiv="Content-Type"
          content="text/html charset=UTF-=
    8"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scal=
    e=1"
        />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <style type="text/css">
          @media (max-width: 499px) {
            u + .body .inbox-fix,
            u + .body .content-shell-table,
            u + .body .footer-shell-table,
            u + .body .footer {
              min-width: calc(100vw - 8.5vw) !important;
            }
    
            .mobile-hide,
            .ios-hide {
              display: none !important;
            }
    
            .desktop-hide,
            .desktop-hide img {
              display: initial !important;
            }
    
            table.desktop-hide {
              display: table !important;
            }
    
            .mobile-100w {
              width: 100% !important;
            }
    
            .mobile-block {
              display: block !important;
            }
    
            .mobile-center {
              margin: 0 auto;
              text-align: center !important;
            }
    
            .inner-padding {
              padding-left: 6% !important;
              padding-right: 6% !important;
            }
    
            .outside-padding {
              padding-left: 12% !important;
              padding-right: 12% !important;
            }
    
            .content-padding {
              padding-left: 6% !important;
              padding-right: 6% !important;
            }
    
            .desktop-hide-max,
            .desktop-hide-max img {
              display: initial !important;
            }
          }
          @media screen and (-webkit-min-device-pixel-ratio: 0) and (max-width: 499px) {
            .container.main-border {
              padding: 0 !important;
            }
    
            .content-shell {
              border: none !important;
            }
          }
          @media yahoo {
            table {
              border-collapse: collapse;
              table-layout: fixed;
            }
    
            table table {
              table-layout: auto;
            }
          }
          .hide-link a,
          .iosnonlink a,
          .hide-link {
            text-decoration: none !important;
            cursor: text;
          }
          @media screen {
            @font-face {
              font-family: ProxzeSans-Light;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5..100,300;1,62.5..100,300&display=swap");
              font-weight: 300;
            }
    
            @font-face {
              font-family: ProxzeSans-Regular;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth@0,62.5..100;1,62.5..100&display=swap");
              font-weight: 400;
            }
    
            @font-face {
              font-family: ProxzeSans-Medium;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5..100,500;1,62.5..100,500&display=swap");
              font-weight: 700;
            }
    
            @font-face {
              font-family: ProxzeSans-Bold;
              src: url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wdth,wght@0,62.5..100,700;1,62.5..100,700&display=swap");
              font-weight: 700;
            }
          }
          @media (max-width: 499px) {
            .color-wrapper {
              width: 100% !important;
            }
          }
          @media (max-width: 499px) {
            .bullet .indent.true {
              width: 8% !important;
            }
    
            .bullet .indent.true {
              padding-left: 3% !important;
            }
    
            .envelope.rtl .bullet .indent.true {
              padding-right: 3% !important;
            }
          }
          @media (max-width: 499px) {
            .bullet-point {
              line-height: 22px !important;
            }
          }
          @media (max-width: 768px) {
            .icon {
              padding-top: 4px !important;
            }
          }
          @media (max-width: 499px) {
            .image .default-image-width img {
              width: 100%;
            }
          }
          @media (max-width: 499px) {
            .mobile-hide-max,
            .ios-hide-max {
              display: none !important;
            }
    
            .inbox-fix {
              display: none;
            }
    
            .desktop-hide-max,
            .desktop-hide-max img {
              display: initial !important;
            }
    
            table.content-shell-table,
            table.footer-shell-table,
            .footer {
              width: 100% !important;
            }
    
            .content {
              width: 100% !important;
            }
          }
          .footer-shell .footer-link {
            line-height: 20px;
          }
          @media (max-width: 500px) {
            .mosaic-module .middle {
              width: 46% !important;
              padding-right: 4% !important;
              padding-left: 4% !important;
            }
    
            .mosaic-module .left,
            .mosaic-module .right {
              width: 24.8% !important;
            }
    
            .mosaic-module .component-image.cell,
            .mosaic-module .single-button .content-padding {
              padding-top: 15px !important;
            }
          }
          @media (max-width: 499px) {
            u + .body .gmail-screen {
              background: #000;
              mix-blend-mode: screen;
            }
    
            u + .body .gmail-difference {
              background: #000;
              mix-blend-mode: difference;
            }
          }
          @media only screen and (max-width: 500px) {
            .main-header-icon-cell {
              width: 12% !important;
            }
    
            .header-copy-cell {
              width: 85% !important;
            }
    
            .header-copy-cell-with-profile-icon {
              width: 78% !important;
            }
    
            .proxze-logo-cell {
              width: 10% !important;
            }
          }
          @media (max-width: 499px) {
            .evidence-cards-component-image-cell {
              width: 12% !important;
            }
          }
          @media (max-width: 499px) {
            .evidence-images img {
              width: 100% !important;
              height: auto !important;
            }
          }
          @media (max-width: 499px) {
            .marker {
              padding: 5px 7px 5px 7px !important;
            }
          }
          @media (max-width: 499px) {
            .evidence-trailer-component-image-cell {
              width: 12% !important;
            }
          }
          @media (max-width: 500px) {
            .button-copy a {
              padding: 13px 0px !important;
              width: 100% !important;
            }
          }
          @media (min-width: 501px) {
            .button-copy a {
              padding: 13px 40px;
            }
          }
          @media (max-width: 499px) {
            .image .default-image-width img {
              width: 100%;
            }
    
            .artwork img {
              width: 100% !important;
            }
    
            .number img {
              width: 100% !important;
            }
          }
          @media (max-width: 499px) {
            .episode-content-cell {
              width: 40% !important;
            }
    
            .episode-content-cell-image {
              width: 100% !important;
              height: auto !important;
            }
    
            .episode-content-cell-progress-bar {
              width: 100% !important;
              height: auto !important;
            }
          }
          @media (max-width: 499px) {
            .exp-img-1 img {
              width: 70% !important;
            }
    
            .exp-img-2 {
              padding-left: 20px !important;
            }
    
            .exp-img-2 img {
              width: 85% !important;
            }
    
            .exp-img-3 img {
              width: 85% !important;
            }
    
            .exp-img-4 img {
              width: 85% !important;
            }
    
            .calendar img {
              width: 85% !important;
              height: auto !important;
            }
          }
          @media (max-width: 499px) {
            .logo-with-horizontal-date-logo-image-cell {
              width: 60% !important;
            }
          }
          @media (max-width: 499px) {
            .thumbs-button-image-width {
              width: 80% !important;
            }
    
            .thumbs-button-cell-spacer {
              width: 6% !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-hero-inner-body-cell {
              width: 88% !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-hero-inner-body-cell {
              width: 88% !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-themed-category-spacer-td {
              height: 12px !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .right-pencil-image img {
              width: 75% !important;
              height: auto !important;
            }
    
            .left-pencil-image img {
              width: 85% !important;
              height: auto !important;
            }
    
            .left-pencil-cell {
              width: 30% !important;
            }
    
            .right-pencil-cell {
              width: 30% !important;
            }
    
            .color-page-cell {
              width: 40% !important;
            }
    
            .printable-logo-image img {
              width: 40% !important;
              height: auto !important;
            }
          }
          @media only screen and (max-width: 500px) {
            .module-kar-theme-bars-images img {
              width: 100% !important;
              height: auto !important;
            }
          }
          .footer .address .hide-link,
          .footer .address .hide-link a {
            cursor: pointer;
            text-decoration: underline;
          }
        </style>
      </head>
      <body
        class="body"
        style="background-color: #eaeaea; margin-top: 0; padding: 0; margin: 0"
      >
        <table
          width="100%"
          border="0"
          class="envelope account"
          data-testid="envelope"
          cellpadding="0"
          cellspacing="0"
          style="background-color: #eaeaea"
          bgcolor="#eaeaea"
        >
          <tbody>
            <tr>
              <td
                align="center"
                class="container"
                style="background-color: #eaeaea; margin-top: 0"
                bgcolor="#eaeaea"
              >
                <table
                  align="center"
                  border="0"
                  class="content"
                  cellpadding="0"
                  cellspacing="0"
                  style="background-color: #ffffff; width: 500px"
                  width="500"
                  bgcolor="#ffffff"
                >
                  <tbody>
                    <tr>
                      <td align="center" class="shell">
                        <a
                          href="${process.env.CLIENT_URL}"
                          class="disabled-plaintext"
                          data-testid="logo"
                          style="color: inherit"
                          ><table
                            class="logo image"
                            width="100%"
                            data-testid="image"
                            cellpadding="0"
                            cellspacing="0"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="cell logo content-padding"
                                  align="left"
                                  style="
                                    padding-left: 40px;
                                    padding-right: 40px;
                                    padding-top: 20px;
                                  "
                                >
                                  <img
                                    src="https://res.cloudinary.com/jsskrh/image/upload/v1707051577/sage-grey/proxze/hoay5yb9baupjoohbhth.png"
                                    alt="Proxze"
                                    width="120"
                                    border="0"
                                    class="undefined"
                                    style="
                                      -ms-interpolation-mode: bicubic;
                                      border: none;
                                      outline: none;
                                      border-collapse: collapse;
                                      display: block;
                                      border-style: none;
                                    "
                                  />
                                </td>
                              </tr>
                            </tbody></table
                        ></a>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy h1 content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Bold, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 700;
                                  font-size: 36px;
                                  line-height: 43px;
                                  letter-spacing: -1px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                Welcome to Proxze
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                Hi
                                <span
                                  class="break-word"
                                  style="word-break: break-all"
                                  >${firstName}</span
                                >,
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                You&#x27;re almost set to start using Proxze. Please
                                click on the button below to verify your email.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          class="single-button mobile-100w"
                          align="center"
                          width="100%"
                          data-testid="single-button"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="content-padding"
                                align="center"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  padding-top: 20px;
                                "
                              >
                                <table
                                  class="inner-button border-false"
                                  style="
                                    background-color: #38a139;
                                    border-radius: 4px;
                                    width: 100%;
                                  "
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  bgcolor="#38a139"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="h5 button-td"
                                        align="center"
                                        style="
                                          font-family: ProxzeSans-Bold, Helvetica,
                                            Roboto, Segoe UI, sans-serif;
                                          font-weight: 700;
                                          font-size: 14px;
                                          line-height: 17px;
                                          letter-spacing: -0.2px;
                                          padding-top: 20px;
                                          padding: 14px 40px;
                                          color: #ffffff;
                                        "
                                      >
                                        <a
                                          class="h5"
                                          href="${process.env.CLIENT_URL}/verify-email/${encodedToken}"
                                          style="
                                            font-family: ProxzeSans-Bold, Helvetica,
                                              Roboto, Segoe UI, sans-serif;
                                            font-weight: 700;
                                            font-size: 14px;
                                            line-height: 17px;
                                            letter-spacing: -0.2px;
                                            text-align: center;
                                            text-decoration: none;
                                            display: block;
                                            color: #ffffff;
                                          "
                                          >Verify Email</a
                                        >
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          width="100%"
                          class="spacer-table"
                          data-testid="spacer"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="spacer"
                                style="font-size: 0; line-height: 0; height: 20px"
                                height="20"
                              >
                                =C2=A0
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                If that doesn&#x27;t work, copy and paste the
                                following link in your browser:<br />
                                <a
                                  href="${process.env.CLIENT_URL}/verify-email/${encodedToken}"
                                  style="color: inherit; text-decoration: underline"
                                  >${process.env.CLIENT_URL}/verify-email/${encodedToken}</a
                                >
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy p content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-family: ProxzeSans-Regular, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 400;
                                  font-size: 16px;
                                  line-height: 21px;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                              We&#x27;re here to help if you need it. Contact the support team at 
                              <a
                                href="mailto:support@proxze.com"
                                style="color: inherit; text-decoration: underline"
                                >support@proxze.com</a
                              >
                              and
                              <a
                                href="tel:+23402018870030"
                                style="color: inherit; text-decoration: underline"
                                >+23402018870030</a
                              >.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          align="left"
                          width="100%"
                          class="copy-table"
                          data-testid="copy"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                class="copy h5 medium content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  font-size: 14px;
                                  line-height: 17px;
                                  letter-spacing: -0.2px;
                                  font-family: ProxzeSans-Medium, Helvetica, Roboto,
                                    Segoe UI, sans-serif;
                                  font-weight: 700;
                                  padding-top: 20px;
                                  color: #221f1f;
                                "
                              >
                                The Proxze team
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          width="100%"
                          data-testid="divider"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="divider content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  padding-top: 30px;
                                "
                              >
                                <table
                                  align="center"
                                  width="100%"
                                  cellpadding="0"
                                  cellspacing="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="empty divider-border"
                                        style="
                                          font-size: 0;
                                          line-height: 0;
                                          border-style: solid;
                                          border-bottom-width: 0;
                                          border-color: #221f1f;
                                          border-top-width: 2px;
                                        "
                                      >
                                        =C2=A0
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          class="single-button mobile-100w"
                          align="center"
                          width="100%"
                          data-testid="single-button"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                class="content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  padding-top: 30px;
                                "
                                align="center"
                              >
                                <table
                                  class="inner-button border-true"
                                  style="
                                    border-width: 2px;
                                    border-style: solid;
                                    border-radius: 4px;
                                    border-color: #000000;
                                    background-color: #ffffff;
                                    width: 100%;
                                  "
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  bgcolor="#FFFFFF"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="h5 button-td"
                                        style="
                                          font-family: ProxzeSans-Bold, Helvetica,
                                            Roboto, Segoe UI, sans-serif;
                                          font-weight: 700;
                                          font-size: 14px;
                                          line-height: 17px;
                                          letter-spacing: -0.2px;
                                          padding-top: 20px;
                                          padding: 14px 40px;
                                          color: #000000;
                                        "
                                        align="center"
                                      >
                                        <a
                                          class="h5"
                                          href="${process.env.CLIENT_URL}"
                                          style="
                                            font-family: ProxzeSans-Bold, Helvetica,
                                              Roboto, Segoe UI, sans-serif;
                                            font-weight: 700;
                                            font-size: 14px;
                                            line-height: 17px;
                                            letter-spacing: -0.2px;
                                            text-align: center;
                                            text-decoration: none;
                                            display: block;
                                            color: #000000;
                                          "
                                          >Visit Proxze</a
                                        >
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        class="footer-shell"
                        style="background-color: #ffffff"
                        bgcolor="#ffffff"
                      >
                        <table
                          class="footer"
                          width="100%"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="center"
                                valign="top"
                                class="footer-shell content-padding"
                                style="
                                  padding-left: 40px;
                                  padding-right: 40px;
                                  background-color: #ffffff;
                                "
                                bgcolor="#ffffff"
                              >
                                <table
                                  width="100%"
                                  class="spacer-table"
                                  data-testid="spacer"
                                  cellpadding="0"
                                  cellspacing="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        class="spacer"
                                        style="
                                          font-size: 0;
                                          line-height: 0;
                                          height: 40px;
                                        "
                                        height="40"
                                      >
                                        =C2=A0
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        class="footer-icon-wrapper"
                                        style="padding: 0 20px 0 0"
                                      >
                                        <table
                                          class="component-image image"
                                          width="100%"
                                          data-testid="image"
                                          cellpadding="0"
                                          cellspacing="0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                class="cell component-image none"
                                                align="center"
                                                style="padding-top: 0"
                                              >
                                                <img
                                                  src="https://res.cloudinary.com/jsskrh/image/upload/v1707051577/sage-grey/proxze/hoay5yb9baupjoohbhth.png"
                                                  alt
                                                  width="50"
                                                  border="0"
                                                  class="undefined"
                                                  style="
                                                    -ms-interpolation-mode: bicubic;
                                                    border: none;
                                                    outline: none;
                                                    border-collapse: collapse;
                                                    display: block;
                                                  "
                                                />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td valign="top" class="footer-copy-wrapper">
                                        <table
                                          class="footer-table"
                                          width="100%"
                                          valign="top"
                                          cellpadding="0"
                                          cellspacing="0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td class="footer-copy-shell">
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy legal-top"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy legal none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          letter-spacing: -0.1px;
                                                          color: #a4a4a4;
                                                          font-size: 15px;
                                                          line-height: 19px;
                                                          padding-top: 0;
                                                        "
                                                      >
                                                        <span
                                                          class="dark-legal"
                                                          style="color: #4d4d4d"
                                                          >By joining Proxze,
                                                          you&#x27;ve agreed to our
                                                          <a
                                                            href="${process.env.CLIENT_URL}/terms-of-service"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Terms of Service</a
                                                          >
                                                          and
                                                          <a
                                                            href="${process.env.CLIENT_URL}/privacy-policy"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Privacy Statement</a
                                                          >.<br /><br />Please
                                                          review the
                                                          <a
                                                            href="${process.env.CLIENT_URL}/privacy-policy"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Privacy Statement</a
                                                          >
                                                          to learn how we use your
                                                          personal information, and
                                                          go to your
                                                          <a
                                                            href="${process.env.CLIENT_URL}/settings/contact-info"
                                                            style="
                                                              text-decoration: underline;
                                                              color: #4d4d4d;
                                                            "
                                                            >Account Settings</a
                                                          >
                                                          for more details about
                                                          related features.
                                                        </span>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  width="100%"
                                                  class="spacer-table"
                                                  data-testid="spacer"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        class="spacer"
                                                        style="
                                                          font-size: 0;
                                                          line-height: 0;
                                                          height: 20px;
                                                        "
                                                        height="20"
                                                      >
                                                        =C2=A0
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy p1 none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 14px;
                                                          line-height: 18px;
                                                          letter-spacing: -0.25px;
                                                          color: #a4a4a4;
                                                          padding-top: 0;
                                                        "
                                                      >
                                                        <span class="ignore-diff"
                                                          >Questions? Contact support
                                                          </span
                                                        >
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy address"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy legal none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 11px;
                                                          line-height: 14px;
                                                          letter-spacing: -0.1px;
                                                          color: #a4a4a4;
                                                          padding-top: 0;
                                                        "
                                                      >
                                                        <span
                                                          class="hide-link"
                                                          style="
                                                            cursor: pointer;
                                                            text-decoration: none;
                                                          "
                                                          ><a
                                                            href="${process.env.CLIENT_URL}"
                                                            style="
                                                              color: #a4a4a4;
                                                              cursor: pointer;
                                                              text-decoration: none;
                                                            "
                                                            >MyProxze Limited</a
                                                          ></span
                                                        >
                                                      </td>
                                                    </tr>
                                                    =
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table"
                                                  ="data-testid"
                                                  ="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        ali="gn"
                                                        ="left"
                                                        class="copy p2 none"
                                                        style="
                                                          font-family: ProxzeSans-Regula=
                                                              r,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 12= px;
                                                          line-height: 15px;
                                                          letter-spacing: -0.12px;
                                                          padding-top: 20px;
                                                          color: #a9a6a6;
                                                        "
                                                      >
                                                        <a
                                                          class="footer-link"
                                                          href="${process.env.CLIENT_URL}/settings/notification"
                                                          styl="e"
                                                          ="text-decoration: underline; line-height: 20px; color: #a4a4a4;"
                                                          >Notification Settings</a
                                                        ><br /><a
                                                          class="footer-link"
                                                          href="${process.env.CLIENT_URL}/terms-of-service"
                                                          style="
                                                            text-decoration: underline;
                                                            line-height: 20px;
                                                            color: #a4a4a4;
                                                          "
                                                          >Terms of Service</a
                                                        ><br /><a
                                                          class="footer-link"
                                                          href="${process.env.CLIENT_URL}/privacy-policy"
                                                          style="
                                                            text-decoration: underline;
                                                            line-height: 20px;
                                                            color: #a4a4a4;
                                                          "
                                                          >Privacy</a
                                                        >
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  align="left"
                                                  width="100%"
                                                  class="copy-table footer-copy"
                                                  data-testid="copy"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        class="copy legal none"
                                                        style="
                                                          font-family: ProxzeSans-Regular,
                                                            Helvetica, Roboto,
                                                            Segoe UI, sans-serif;
                                                          font-weight: 400;
                                                          font-size: 11px;
                                                          line-height: 14px;
                                                          letter-spacing: -0.1px;
                                                          padding-top: 20px;
                                                          color: #a4a4a4;
                                                        "
                                                      >
                                                        This message was mailed to
                                                        <a
                                                          href="${process.env.CLIENT_URL}"
                                                          class="hide-link ignore-diff"
                                                          style="
                                                            cursor: text;
                                                            color: #a4a4a4;
                                                            text-decoration: none;
                                                          "
                                                          >[${email}]</a
                                                        >
                                                        by Proxze as part of your
                                                        Proxze membership.<br />
                                                      </td>
                                                      <table
                                                        width="100%"
                                                        class="spacer-table"
                                                        data-testid="spacer"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                      >
                                                        <tbody>
                                                          <tr>
                                                            <td
                                                              class="spacer"
                                                              style="
                                                                font-size: 0;
                                                                line-height: 0;
                                                                height: 40px;
                                                              "
                                                              height="40"
                                                            >
                                                              =C2=A0
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
    `;
};

const sendMail = async (params) => {
  const client = new SESClient({ region: "us-east-1" });
  const command = new SendEmailCommand(params);

  // console.log('event:', event)
  console.log("test");
  await client.send(command).then(
    (data) => {
      // process data.
      console.log(data);
      // return {
      //   statusCode: 200,
      //   body: JSON.stringify("Email sent successfully"),
      // };
    },
    (error) => {
      // error handling.
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify("Failed to send email"),
      };
    }
  );
};

const sendVerificationMail = async (user) => {
  try {
    const { firstName, email } = user;
    const verificationToken = jwt.sign(
      { email: email },
      process.env.VERIFICATION_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const base64UrlEncode = (input) => {
      return input.replace(/\./g, "(");
    };

    const encodedToken = base64UrlEncode(verificationToken);

    // if (process.env.ENVIRONMENT !== "stage") {
    //   // Create sendEmail params
    //   var params = {
    //     Destination: {
    //       ToAddresses: [email],
    //     },
    //     Message: {
    //       Body: {
    //         Html: {
    //           Charset: "UTF-8",
    //           Data: createVerificationMail({
    //             firstName,
    //             email,
    //             encodedToken,
    //             liveUrl: process.env.CLIENT_URL,
    //           }),
    //         },
    //         Text: {
    //           Charset: "UTF-8",
    //           Data: `Hi ${firstName}, You're almost set to start using Proxze. Please click on the button below to verify your email.: https://${process.env.CLIENT_URL}/verify-email/${encodedToken}`,
    //         },
    //       },
    //       Subject: {
    //         Charset: "UTF-8",
    //         Data: "Verify Your Email",
    //       },
    //     },
    //     Source: process.env.MAIL_USER,
    //   };

    //   await sendMail(params);
    // } else {
    let transporter = nodemailer.createTransport({
      host: "mail.proxze.com",
      port: 465,
      secure: true, // use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    const msg = {
      to: email,
      from: process.env.MAIL_USER,
      subject: "Verify Your Email",
      text: `Hi ${firstName}, You're almost set to start using Proxze. Please click on the button below to verify your email.: https://${process.env.CLIENT_URL}/verify-email/${encodedToken}`,
      html: createVerificationMail({
        firstName,
        email,
        encodedToken,
        liveUrl: process.env.CLIENT_URL,
      }),
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(msg, (err, info) => {
        if (err) {
          return reject(err);
          console.error(err);
        }
        console.log("email sent");
        resolve("Email sent");
      });
    });
    // }
  } catch (error) {
    console.log(error);
    throw new Error(error);
    return;
  }
};

const sendVerificationText = async (user) => {
  try {
    const { data } = await axios.post(
      "https://v3.api.termii.com/api/sms/send",
      {
        to: "2340" + user?.phoneNumber,
        from: "Proxze",
        sms: `Your verification code is ${user?.phoneToken}`,
        type: "plain",
        channel: "generic",
        api_key: process.env.TERMII_KEY,
      }
    );
    console.log(data);
    return;
  } catch (error) {
    console.log(error);
    throw new Error(error);
    return;
  }
};

const sendResetMail = async (user) => {
  try {
    const { firstName, email, _id } = user;

    const resetToken = jwt.sign(
      { userId: _id },
      process.env.RESET_PASSWORD_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const base64UrlEncode = (input) => {
      return input.replace(/\./g, "(");
    };

    const encodedToken = base64UrlEncode(resetToken);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${encodedToken}`;

    const msg = {
      to: email,
      from: process.env.MAIL_USER,
      subject: "Reset password",
      text: `Hi ${firstName}, You have requested to reset your password. Please click on the link below to reset your password: ${resetUrl}`,
      html: createResetMail({
        firstName,
        email,
        encodedToken,
        resetUrl,
      }),
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(msg, (err, info) => {
        if (err) {
          return reject(err);
          console.error(err);
        }
        console.log("email sent");
        resolve("Email sent");
      });
    });
  } catch (err) {
    console.log(err);
    return err;
  }
};
const templates = join(__dirname, "templates");
const generateTemplate = async ({ name, data = {} }) => {
  return renderFile(join(templates, `${name}.ejs`), data);
};

const sendReregisterMail = async () => {
  try {
    // Create sendEmail params
    const htmlData = await generateTemplate({ name: "reregister" });
    var params = {
      Destination: {
        ToAddresses: [
          "ufuoma.uwejeyan@sage-grey.com",
          "jesse-akorah@sage-grey.com",
          "kasieakorah@gmail.com",
          "arewaomobolaji636@gmail.com",
          "admin@proxze.com",
          "adelesidavid@gmail.com",
          "babajide.adesiyun@gmail.com",
          "brightlankii@gmail.com",
          "Innocents704@gmail.com",
          "mercynwaneho@gmail.com",
          "flourishkehinde@gmail.com",
          "ruthafe22@gmail.com",
          "ensamuel11@gmail.com",
          "gloeze@yahoo.com",
          "olaitanb4@gmail.com",
          "kemiolamart@gmail.com",
          "adeyeanqarh@gmail.com",
          "ifestephanie9@gmail.com",
          "abiodunjudson@gmail.com",
          "hephzibarf@gmail.com",
          "royalprince00001@gmail.com",
          "enemyck4real@gmail.com",
          "chidinma.idoko@sage-grey.com",
        ],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlData,
          },
          Text: {
            Charset: "UTF-8",
            Data: `Dear Proxzy, We kindly request that you complete your registration as a Proxze`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Complete Your Registration as a Proxze",
        },
      },
      Source: process.env.MAIL_USER,
    };

    await sendMail(params);
  } catch (err) {
    console.log(err);
    return err;
  }
};

const sendRegistrationMail = async (user) => {
  try {
    const { email, superProxze } = user;
    const registrationToken = jwt.sign(
      { superProxze, email },
      process.env.VERIFICATION_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const base64UrlEncode = (input) => {
      return input.replace(/\./g, "(");
    };

    const encodedToken = base64UrlEncode(registrationToken);

    const htmlData = await generateTemplate({
      name: "register",
      data: { encodedToken, email },
    });

    // if (process.env.ENVIRONMENT !== "stage") {
    //   // Create sendEmail params
    //   var params = {
    //     Destination: {
    //       ToAddresses: [email],
    //     },
    //     Message: {
    //       Body: {
    //         Html: {
    //           Charset: "UTF-8",
    //           Data: htmlData,
    //         },
    //         Text: {
    //           Charset: "UTF-8",
    //           Data: `Dear User, You're almost set to start using Proxze. Please click on the button below to register: https://${process.env.CLIENT_URL}/register/sub/${registrationToken}`,
    //         },
    //       },
    //       Subject: {
    //         Charset: "UTF-8",
    //         Data: "Verify Your Email",
    //       },
    //     },
    //     Source: process.env.MAIL_USER,
    //   };

    //   await sendMail(params);
    // } else {
    let transporter = nodemailer.createTransport({
      host: "mail.proxze.com",
      port: 465,
      secure: true, // use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    const msg = {
      to: email,
      from: process.env.MAIL_USER,
      subject: "Verify Your Email",
      text: `Dear User, You're almost set to start using Proxze. Please click on the button below to register: https://${process.env.CLIENT_URL}/register/sub/${registrationToken}`,
      html: htmlData,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(msg, (err, info) => {
        if (err) {
          return reject(err);
        }
        resolve("Email sent");
      });
    });
    // }
  } catch (error) {
    console.log(err);
    return;
  }
};

module.exports = {
  createVerificationMail,
  sendMail,
  sendVerificationMail,
  sendRegistrationMail,
  sendResetMail,
  sendReregisterMail,
  sendVerificationText,
};
