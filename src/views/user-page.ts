import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../components/user-login-signup";
import  "./../styles/reset.css";
import "../styles/page.css";
import {UserLoggedInEvent} from "../components/user-login-signup";

@customElement('user-page')
  export class UserPage extends LitElement { 
  
    static properties = {
        isSignup: {type: Boolean}
    };
    isSignup = false;    
  
      render() {
        return html`
          <main class="page">
            <div class="userContent">
            ${this.isSignup
              ? html`
                  <user-signup @myLoggedIn=${this._handleLoggedIn}>
                  </user-signup>
                  <p>Already have an account? <a @click=${() => {this.isSignup = false;}}>Click here</a> to login</p>
                `
              : html`
                  <user-login @myLoggedIn=${this._handleLoggedIn}></user-login> 
                  <p>Don't have an account?  <a @click=${() => {this.isSignup = true;}}>Click here</a> to signup</p>
                `}
                </div>
          </main>
        `;
      }

      static styles = [
        css`
          :host {
            display: contents;
          }
        `,
        css`
         .userContent {
            width:30em;
            font-family: sans-serif;
            justify-content: center;
            margin: auto;
        }
        a {
          cursor: pointer; 
          color: var(--color-accent);
        }
        `
      ];

      private _handleLoggedIn(e: CustomEvent<UserLoggedInEvent>) {
        const detail: UserLoggedInEvent = e.detail;
        console.log("user-page, myLoggedIn", detail);
        this.requestUpdate();

        // send an event to user-page container
        const event = new CustomEvent<UserLoggedInEvent>("myLoggedIn", {
          detail: {
            myUsername: detail.myUsername
          }
        });
        this.dispatchEvent(event);
      }
  }