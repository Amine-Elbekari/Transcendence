import AbstractView from "./AbstractView.js";
import { getCookie } from "../utils/cookieUtils.js";
import { check2faRequired,verify2FA,logoutTwoFactor } from "../api/apiService.js";
import { navigateTo } from "../router.js";
import config from '../config/config.js';
export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Login");
  }
  init()
  {
      this.verify2faEvent();
      this.First2FaCheck();
  }

  verify2faEvent()
  {
    if(document.getElementById('verifyBtn'))
    {
        document.getElementById('verifyBtn').addEventListener('click',async function()  {
    
          // const tokenInput = document.getElementById('token-input');
          // const result = await verify2FA(tokenInput.value,"2");
      
          // if (result == "true") {
          //     // navigateTo('/profile/aniouar');
          //     console.log('he je suis la');
          //     navigateTo('/home');
          //     // Handle successful 2FA verification
          // } else {
          //     console.log('Failed to verify 2FA');
          //     document.getElementById('alert').textContent = 'Failed to verify 2FA';
          //     // Handle failed 2FA verification
          // }
          const response = await logoutTwoFactor();
          console.log(response);
          if (response.success) {
              navigateTo('/login');
              // Redirect user to the login page or handle the UI changes after logout
              // window.location.href = '/login-page-url'; 
          } else {
              // throw new Error('Logout failed with status: ' + response.status);
              console.log('errro');
          }
      });
    }
   
  }

    First2FaCheck()
    {
        const textInputCheck = document.getElementById('token-input');
        const cardBox  = document.getElementById('card-box');
        if(textInputCheck)
        {
          var counter = 0;
          textInputCheck.addEventListener('input', async function(event) {
            console.log(counter);
            if(counter > event.target.value.length)
                cardBox.style.backgroundColor = 'white';
            counter  = event.target.value.length;
            if(event.target.value.length == 6)
            {
              const result = await verify2FA(event.target.value,"2");
              if (result == "true")
              {
                  cardBox.style.backgroundColor = 'green';
                  navigateTo('/home');

              }
              else
              {
                  console.log('Failed to verify 2FA');
                  if (cardBox)
                  {
                      cardBox.style.backgroundColor = 'red';
                  }


              }
            }
          });
        }
        
    }  

  async  getLoginFlow() {
    const data = await check2faRequired();
    let loginFlow;

    const require_2fa = data.require_2fa;
    const avatar_url = data.avatar_url;
    console.log(data);
    if (require_2fa == 'true') {
      const max = 6;
      console.log('check one');
        loginFlow = `
        <div class="container" style="position: absolute;">
        <br>
        <div class="row">
            <div class="col-lg-5 col-md-7 mx-auto my-auto">
                <div class="card" id="card-box">
                    <div class="card-body px-lg-5 py-lg-5 text-center">
                        <img src="${avatar_url}" class="rounded-circle avatar-lg img-thumbnail mb-4" alt="profile-image">
                        <h2 class="text-info">2FA Security</h2>
                        <p class="mb-4">Enter 6-digits code from your athenticatior app.</p>
                        <form>
                            <div class="row mb-4"  style="justify-content: center;">
                                <div class="col-lg-12" style="width: 180px;">
                                    <input type="text" class="form-control text-lg text-center" id="token-input" placeholder="_" aria-label="2fa" maxlength="${max}" >
                                </div>
                            </div>
                            <div class="text-center">
                              <div class="alert-msg" id="alert"></div>
                              <button type="button" class="btn bg-info btn-lg my-4" id="verifyBtn">Logout</button>
                               
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        `;
    } else if (require_2fa == 'false' ) {
      console.log('check');
        // Your login options HTML
        loginFlow = ` 
        
        
        <div class="container custom-box">
        <div class = "row">
        <div class = "col col-left">
        <div class = "box">
            <p class="msg">Play with Bots !</p>
            <p class="msg">Invite your friends !</p>
            <p class="msg">Setup a tournement !</p>
            <p class="for-what"> What are you waiting for sing in and play !</p>
            <a href="${config.API_BASE_URL}/api/oauth/login/" class="">
            <button class="intra btn btn-primary">
              SING IN WITH INTRA
            </button>
             </a>
             <a href='${config.API_BASE_URL}/api/oauth/google_login/'>
                <button class="google btn btn-primary">
                    SING IN WITH GOOGLE
                  </button>
             </a>
        </div>
        </div>
          <div class = "col head-txt">
          <div class = "box h-txt">
          <div class="word-reveal">
            <p id="masked-word" class = "masked-word">Online <span class="moving-I">|</span><span class="bouncing-dot">&#xb7</span></p>
            <span class="">Pong</span>
            <div class="word-reveal">
            <p id="masked-word" class="masked-word"><span class="moving-I">|</span><span class="bouncing-dot">&#xb7</span> Game</p>
          </div>
          </div>
          </div>
        </div>
        
        
        
      `;
    }

    return loginFlow;
  }




  async getHtml() {
    loadCSS('/css/login-style.css');
    removeCSS("profile");
    const loginFlow = await this.getLoginFlow();

  


  

    return /*html*/ `


    <div class="video-section">
      <video autoplay muted loop id="myVideo" class="#">
        <source src="/assets/pong-vid.mp4" type="video/mp4" />
      </video>
    </div>
     
   
      ${loginFlow}
   



  
     `;
  }
}

function loadCSS(url, id) {
  const link = document.createElement("link");
  link.href = url;
  link.type = "text/css";
  link.rel = "stylesheet";
  link.id = id;
  document.head.appendChild(link);
}

function removeCSS(id) {
  const linkElement = document.getElementById(id);
  if (linkElement) {
    document.head.removeChild(linkElement);
  }
}
