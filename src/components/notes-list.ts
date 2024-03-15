
import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import { APIRequest, serverPath } from "../rest";
import { Note } from '../models/Note';
import {
    APIUser,
    AuthenticatedUser,
    FormDataRequest
  } from     "../rest";

@customElement('note-list')
export class NoteList extends LitElement {
    private sort = 1;
    
    @state()
    user: APIUser =
      AuthenticatedUser.authenticateFromLocalStorage(() =>
        this._signOut()
      );
  
    @property({ reflect: true, type: Boolean })
    on: boolean = false;

    @property()
    username: string = "";

    static properties = {
        notes: {type: Array<Note>},
        isAddNote: {type: Boolean}
    };
    notes = Array<Note>();
    isAddNote = false;


    render() {
        const dialog = html`
        <dialog id="add-note-form">
            <form  @submit=${this._handleAddNote}>
                <h2>Add Note for ${this.username}</h2>
                <input type="hidden" name="username" value="${this.username}">
                <textarea name="text" rows="10" cols="50"></textarea>
                <div>
                    <button type="submit" class="add-button">Add</button>
                    <button type="button" class="add-button" @click=${this._handleAddNoteClose}>close</button>
                </div>
                
            </form>
        </dialog>
        `;

        // const showNote = html`
        //     <dialog id="show-note">
        //     <form  @submit=${this._handleAddNote}>
        //         <h2>Add Note for ${this.username}</h2>
        //         <input type="hidden" name="username" value="${this.username}">
        //         <textarea name="text" rows="10" cols="50"></textarea>
        //         <div>
        //             <button type="submit" class="add-button">Add</button>
        //             <button type="button" class="add-button" @click=${this._handleAddNoteClose}>close</button>
        //         </div>
                
        //     </form>
        // </dialog>
        // `;


        return html`
            ${this.isAddNote ? dialog: ""}
            <h2 id="sub-title">Notes for ${this.username ? `${this.username}` : "all users"}</h2>

            <div class="grid">
                <span><strong></strong></span>
                <span><strong>Author</strong></span>
                <span><strong>Note</strong></span>
                <span><strong>Created</strong></span>
                <span><strong></strong></span>

                ${repeat(this.notes, (note) => note._id, (note, index) => html`
                    <span>${index + 1}</span>
                    <span>${note.username}</span>
                    <!-- <span><a @click=${() => this._getNotesByUser(note.username) }>${note.username}</a></span> -->
                    <span>${note.text}</span>
                    <span>${note.createDate.toLocaleString()}</span>
                    <span><a @click=${() => this._deleteNote(note._id)}>Delete</a></span>
                `)}
            </div>

            <div class="grid-buttons-container">
                <div><button @click=${this._addNewNoteButtonClick}>Add New Note</button></div>
                <div>
                    <button @click=${this.toggleSort}>Sort Notes By Created Datetime</button>
                </div>
                <!-- <div><button @click=${this._handleThemeChange}>Toggle theme</button></div> -->
                <!-- <div><button @click=${this._signOut}>Sign out</button></div> -->
                <!-- ${this.username
                    ? html`
                        <button @click=${this._getAllNotes}>Show All Notes</button>
                        `
                    : html` `
                } -->
            </div>
        </div>
    `;
    }
    static styles = css`
   
        @import url('https://fonts.googleapis.com/css2?family=Handlee&display=swap');

        :host {
        display: contents;
        }
        body{
            font-family: var(--font-family-body);

        }
        h2 { color: var(--color-accent)}
        .grid {
            display: grid;
            grid-template-columns: 2em 7em 3fr 1.5fr 5em;
            //border-top: 1px solid black;
            //border-right: 1px solid black;
            /* background-color: var(--color-background-form); */
            background-color: rgba(0, 0, 0, 0);
        }

        .grid > span {
            padding: 8px 8px;
            //border-left: 1px solid black;
            //border-bottom: 1px solid black;
        }

        .grid-buttons-container{
            display: grid;
            grid-template-columns: auto auto auto auto;
            align-content: space-evenly;
            gap: 20px;
            padding: 10px 0;
        }

        .grid-buttons-container > div {
            /* background-color: rgba(255, 255, 255, 0.8); */
            /* text-align: center; */
            padding: 20px 0;
            font-size: 20px;
            margin-top: -6px;
        }
        button{
            padding: 10px 20px;
            font-size: 1em;
            color: var(--main-button-color);
            /* background-color: var(--color-accent); */
            /* border-color: var(--color-background-form); */
            background: none;
            border: none;
            cursor: pointer;
        }

        dialog {
            display: flex;
            gap: 4rem;
            background-image: var(--background-image-lines);
            
        }
        form {
            text-align: center;
            display: grid;
        }
        form > textarea {
            padding: 10px;
            font-size: 1em;
            margin-bottom: 20px;
            /* background-color: var(--text-area-background); */
            /* background-image: var(--background-image-lines); */
            background-color: rgba(0, 0, 0, 0);
            line-height: 2.8em;   
            border: none;
            color: var(--text-color);
        }
      
        form > div{
            text-align: center;
        }
        .add-button{
            background-color: var(--color-background-form);
            color: var(--color-accent);
            border-color: var(--color-accent);
        }
        a {
          cursor: pointer; 
          color: var(--color-accent);
          text-decoration: underline;
        }
        #sub-title{
            margin-top: 54px;
            margin-bottom: 10px;
        };
        #add-note-form{
            border: 2px;
        }
        
        
    `;


    private toggleSort() {
        this.sort *= -1;
        this.notes = [...this.notes.sort((a, b) =>
            this.sort * (a.username.localeCompare(b.username) ||
            a._id.localeCompare(b._id)))];
    }

    connectedCallback() {
        console.log("connectedCallback")
        this._fetchData()
        super.connectedCallback();
      }
    
    _getNotesByUser(selectedUser: string){
        if (this.username != selectedUser)
        {
            this.username = selectedUser;
            this._fetchData();
        }
    }  
    _getAllNotes(){
        if (this.username){
            this.username = "";
            this._fetchData();
        }
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
        .then((data: Array<Note>) => {
            console.log(data)
            this.notes = data;
        });
    }

    _signOut() {
        this.user = APIUser.deauthenticate(this.user);
        document.location.reload();
      }

      
    _deleteNote(_id: string){
        console.log(_id);
        const path = `/note/${_id}`;
        const request = new APIRequest();
        request.delete(path)
        .then((res) => {
            if (res.status === 200) {
                this._fetchData();
            } else {
                console.log(res)
            }
          });
    }  

    _addNewNoteButtonClick(){
        this.isAddNote = true;
        this._toggleDialog(true);
    }

    _handleAddNoteClose(){
        this.isAddNote = false;
        this._toggleDialog(false);
    }

    _handleAddNote(event: SubmitEvent){

        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const data = new FormData(form);
        const request = new FormDataRequest(data);
        console.log(data);

        request
          .post("/note")
          .then((res) => {
            if (res.status === 201) {
                this._fetchData();
                this.isAddNote = false;
                this._toggleDialog(false);
                return res.json();
            } else {
                console.log(res)
            }
          });
    }

    _toggleDialog(open: boolean) {
        const dialog = this.shadowRoot?.querySelector(
        "dialog"
        ) as HTMLDialogElement | null;

        if (dialog) {
        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
        }
    }

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
}