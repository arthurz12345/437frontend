import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../components/notes-list";
import "./user-page";
import  "./../styles/reset.css";
import "../styles/page.css";
import { createContext, provide } from "@lit/context";
import { UserLoggedInEvent } from "../components/user-login-signup";
import { UserSignOutEvent } from "../components/note-header";
import "../components/note-header";

import {
  APIUser,
  AuthenticatedUser,
} from "../rest";
export let authContext = createContext<APIUser>("auth");


@customElement('notes-page')
  export class NotesPage extends LitElement { 

    @provide({ context: authContext })
    @state()
    user: APIUser =
      AuthenticatedUser.authenticateFromLocalStorage(() =>
        this._signOut()
      );
  
    isAuthenticated() {
      console.log("this.user", this.user.authenticated)
      return this.user.authenticated;
    }

    _signOut() {
      this.user = APIUser.deauthenticate(this.user);
      //document.location.reload();
    }
  
      render() {

        const noteList = html`
        
        <main class="page">
        <note-header username="${this.user.username}"  @mySignOut=${this._handleSignOut}></note-header>
          <div class="notesContent">
              <note-list username="${this.user.username}">
              </note-list>
          </div>
        </main>
        `;

        return html`${!this.isAuthenticated() ?  html`<user-page @myLoggedIn=${this._handleLoggedIn}></user-page>` : noteList}`;
      
      }

      static styles = [
        css`
          :host {
            display: contents;
          }
        `,
        css`
         .notesContent {
            width:55em;
            font-family: sans-serif;
            justify-content: center;
            margin: auto;
        }
        `
      ];    

      private _handleLoggedIn(e: CustomEvent<UserLoggedInEvent>) {
        const detail: UserLoggedInEvent = e.detail;
        console.log("note-page, myLoggedIn", detail);
        if (detail.myUsername){
          document.location.reload();
        }
      }

      private _handleSignOut(e: CustomEvent<UserSignOutEvent>) {
        const detail: UserSignOutEvent = e.detail;
        console.log("note-page, mySignOut", detail);
        this.user = APIUser.deauthenticate(this.user);
      }
  }