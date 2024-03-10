import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createContext, provide } from "@lit/context";
import {
  APIUser,
  AuthenticatedUser,
  FormDataRequest
} from "../rest";
export let authContext = createContext<APIUser>("auth");

export interface UserLoggedInEvent {
  myUsername: string;
}


@customElement('user-login')
export class UserLogin extends LitElement { 

    @state()
    loginStatus: number = 0;
  
    @provide({ context: authContext })
    @state()
    user: APIUser =
      AuthenticatedUser.authenticateFromLocalStorage(() =>
        this._signOut()
      );
  
    render() {
        return html`
        <div id="content">
          <form
          @submit=${this._handleLogin}
          @change=${() => (this.loginStatus = 0)}>
          <h2>Please Login</h2>
          <label>
            <span>Username</span>
            <input name="username" required/>
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" required/>
          </label>
          <button type="submit">Sign in</button>
          <span></span>
          <p class="error">${this.loginStatus
              ? `Login failed: ${this.loginStatus}`
              : ""}</p
          >
        </form>
       
        </div>
        `;
      }

      static styles = css`
        :host {
        display: contents;
        }
        form {
        display: grid;
        grid-template-columns: [start] 1fr 2fr [end];
        align-items: baseline;
        }
        form > label {
        display: contents;
        }
        form > h2 {
        grid-column: start / end;
        text-align: center;
        }
        input,
        button {
        font: inherit;
        line-height: inherit;
        margin: 0.25em;
        }
        button {
        grid-column: 2;
        }
        #content {
            font-family: sans-serif;
            justify-content: center;
            margin: auto;
        }
        .error {color: red; padding: 0 10px;}
    `;

      _handleLogin(event: SubmitEvent) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const data = new FormData(form);
        const request = new FormDataRequest(data);
        console.log(data);

        request
          .post("/login")
          .then((res) => {
            if (res.status === 200) {
              return res.json();
            } else {
              this.loginStatus = res.status;
            }
          })
          .then((json) => {
            if (json) {
              console.log("Authentication:", json.token);
              this.user = AuthenticatedUser.authenticate(
                json.token,
                () => this._signOut()
              );
              console.log("this user", this.user);
              this.requestUpdate();


              const event = new CustomEvent<UserLoggedInEvent>("myLoggedIn", {
                detail: {
                  myUsername: this.user.username
                }
              });
              this.dispatchEvent(event);
            }
          });
      }

      _signOut() {
        this.user = APIUser.deauthenticate(this.user);
        document.location.reload();
      }

}

@customElement('user-signup')
export class UserSignup extends LitElement { 
  @state()
  signupStatus: number = 0;

  @provide({ context: authContext })
  @state()
  user: APIUser =
    AuthenticatedUser.authenticateFromLocalStorage(() =>
      this._signOut()
  );

  render() {
    return html`
    <div id="content">
      <form
      @submit=${this._handleSignup}
      @change=${() => (this.signupStatus = 0)}>
      <h2>Fill in the fields to signup</h2>
      <label>
        <span>Username</span>
        <input name="username" required />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required/>
      </label>
      <label>
        <span>First Name</span>
        <input name="firstName" required />
      </label>
      <label>
        <span>Last Name</span>
        <input name="lastName" required/>
      </label>
      <button type="submit">Submit</button>
      <span></span>
      <p class="error">${this.signupStatus
          ? `Signup failed: ${this.signupStatus}`
          : ""}</p
      >
    </form>

    </div>
    `;
  }
  static styles = css`
    :host {
    display: contents;
    }
    form {
    display: grid;
    grid-template-columns: [start] 1fr 2fr [end];
    align-items: baseline;
    }
    form > label {
    display: contents;
    }
    form > h2 {
    grid-column: start / end;
    text-align: center;
    }
    input,
    button {
    font: inherit;
    line-height: inherit;
    margin: 0.25em;
    }
    button {
    grid-column: 2;
    }
    #content {
        font-family: sans-serif;
    }
    .error {color: red; padding: 0 10px;}
`;
_handleSignup(event: SubmitEvent) {
  this.user = APIUser.deauthenticate(this.user);
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);
  const request = new FormDataRequest(data);

  request
    .post("/signup")
    .then((res) => {
      if (res.status === 201) {
        return res.json();
      } else {
        this.signupStatus = res.status;
      }
    })
    .then((json) => {
      if (json) {
        console.log("Authentication:", json.token);
        this.user = AuthenticatedUser.authenticate(
          json.token,
          () => this._signOut()
        );
        console.log("this user", this.user);
        this.requestUpdate();


        const event = new CustomEvent<UserLoggedInEvent>("myLoggedIn", {
          detail: {
            myUsername: this.user.username
          }
        });
        this.dispatchEvent(event);
      }
    });
  }

  _signOut() {
    this.user = APIUser.deauthenticate(this.user);
    document.location.reload();
  }
}