import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { serverPath } from "../rest";

export interface UserSignOutEvent {
    myUsername: string;
  }

@customElement('note-header')
export class NoteList extends LitElement {

    @property({ reflect: true, type: Boolean })
    on: boolean = false;


    @property()
    username: string = "";

   



    render() {
        return html`
        
            <div class="note-header" id="notes-header">
                <h3>${this.username ? `${this.username}` : "My Name"}</h3>
                <div><button id="header-button" @click=${this._handleThemeChange}>Toggle theme</button></div>
                <div><button id="header-button" @click=${this._signOut}>Sign out</button></div>
            </div>
        
        </div>
        `;
    }

    static styles = css`
        :host{
            display: contents;
        }

        button{
            font-size: 1em;
            background: none;
            border: none;
            cursor: pointer;
            
        }   
        .note-header{
            width: 100%;
            height: 30px;
            margin-top: -90px;
            margin-left: 125px;
            background-color: var(--header-background-color);
        }
        #header-button{
            color: var(--header-button-color);
        }
        
    
    `;





    _handleThemeChange() {
        const body = document.body;
        this.on = !this.on;
        if (this.on) {
            body.classList.add("dark-mode");
        }
        else {
            body.classList.remove("dark-mode");
        }
    }


    _signOut() {
        console.log("signout")

        const event = new CustomEvent<UserSignOutEvent>("mySignOut", {
            detail: {
              myUsername: this.username
            }
          });
          this.dispatchEvent(event);
    }

    connectedCallback() {
        console.log("connectedCallback")
        this._fetchData()
        super.connectedCallback();
    }

    _fetchData() {
        const path = this.username ? `/notes/${this.username}` : "/notes"
        fetch(serverPath(path))
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                return null;
            })
           
    }
}

