
import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import { APIRequest, serverPath } from "../rest";
import { Note } from '../models/Note';
import {
    APIUser,
    AuthenticatedUser,
    FormDataRequest
  } from "../rest";

@customElement('note-list')
export class NoteList extends LitElement {
    private sort = 1;
    
    @state()
    user: APIUser =
      AuthenticatedUser.authenticateFromLocalStorage(() =>
        this._signOut()
      );
  
      
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
        <dialog>
            <form @submit=${this._handleAddNote}>
                <h2>Add Note for ${this.username}</h2>
                <input type="hidden" name="username" value="${this.username}">
                <textarea name="text" rows="10" cols="50"></textarea>
                <div>
                    <button type="submit">Add</button>
                    <button type="button" @click=${this._handleAddNoteClose}>close</button>
                </div>
                
            </form>
        </dialog>
        `;


        return html`
            ${this.isAddNote ? dialog: ""}
            <h2>Notes for ${this.username ? `${this.username}` : "all users"}</h2>

            <div class="grid">
                <span><strong></strong></span>
                <span><strong>Created By</strong></span>
                <span><strong>Note</strong></span>
                <span><strong>Created Datetime</strong></span>
                <span><strong>Action</strong></span>

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
                <div><button @click=${this._signOut}>Sign out</button></div>
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
        :host {
        display: contents;
        }
        .grid {
            display: grid;
            grid-template-columns: 2em 7em 3fr 1.5fr 5em;
            border-top: 1px solid black;
            border-right: 1px solid black;
        }

        .grid > span {
            padding: 8px 8px;
            border-left: 1px solid black;
            border-bottom: 1px solid black;
        }

        .grid-buttons-container{
            display: grid;
            grid-template-columns: auto auto auto;
            align-content: space-evenly;
            gap: 20px;
            padding: 10px 0;
        }

        .grid-buttons-container > div {
            /* background-color: rgba(255, 255, 255, 0.8); */
            /* text-align: center; */
            padding: 20px 0;
            font-size: 20px;
            }
        button{
            padding: 10px 20px;
            font-size: 1em;
        }

        dialog {
            display: flex;
            gap: 4rem;
            border-color: #3333;
        }
        form {
            display: grid;
            grid-template-columns: [start]  1fr [end];
            align-items: baseline;
        }
        form > label {
            display: contents;
        }
        form > h2 {
            grid-column: start / end;
            text-align: center;
        }
        form > textarea {
            padding: 10px;
            font-size: 1em;
            margin-bottom: 20px;
        }
        form > div{
            text-align: center;
        }
        a {cursor: pointer;}
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
}