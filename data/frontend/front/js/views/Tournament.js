import AbstractView from "./AbstractView.js";
import { ListParticipantTournament,leaveTournament } from "../api/apiService.js";
import { navigateTo } from "../router.js";
import { checkUserParticipation,
          getTournamentParticipantCount,
          generateTournamentMatches,retrieveMatchesForTournament } from "../api/apiService.js";

import config from '../config/config.js';
        
export default class extends AbstractView {
    constructor(params) {
        super(params);
        // console.log(params.username);
        this.tournamentName = params.name;
        this.username = params.username;
        this.firstLoad = false;
        this.index = 0;
        // this.participantsLoaded = false;
        // Store the username parameter
        this.setTitle("Profile");
        this.ListParticipant();
        // if(checkUserParticipation(this.tournamentName) == false)
        // {

        //   navigateTo('/home');
        //   console.log('Get out like bayer munich 3-0');
        // }

        
    }

    init()
    {
        this.addBeforeUnloadEvent();
    }

    checkLoad()
    {
      return this.firstLoad;
    }

    addBeforeUnloadEvent() {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
      console.log('add event');
    }

    handleBeforeUnload = (event) => {
    event.preventDefault();
    
    // This part won't execute if the user decides to stay on the page
    this.closeWebSocket();
    setTimeout(() => {
        window.location.href = '/home';
        // Redirect after a short delay
    }, 500); 
      // navigateTo('/home');
  }
    //

    initWebSocket() {
      // const wsUrl = `ws://localhost:8000/ws/tournament/${this.tournamentName}/`;
      const wsUrl = `${config.WS_BASE_URL}/ws/tournament/${this.tournamentName}/` ;
      // const wsUrl = `ws://localhost:8000/ws/pong/`;
      this.websocket = new WebSocket(wsUrl);

        // Event listeners for WebSocket
          this.websocket.onopen = this.onWebSocketOpen.bind(this);
          this.websocket.onmessage = this.onWebSocketMessage.bind(this);
          this.websocket.onerror = this.onWebSocketError.bind(this);
          this.websocket.onclose = this.onWebSocketClose.bind(this);
          this.firstLoad = true;
    }

        onWebSocketOpen(event) {
          console.log("WebSocket connection established:", event);

          // Optionally send a message upon connection
          this.websocket.send(JSON.stringify({ username: this.username, action: "joined" }));
      }


      onWebSocketMessage(event) {
          const data = JSON.parse(event.data);

          if(data.status == 'joined')
          {
            console.log("Received WebSocket message:", data);

            // if (!this.participantsLoaded)
            //   return;
  
            const canditDivs = document.querySelectorAll('.candit');
  
            // Find the first empty div
            const firstEmptyDiv = Array.from(canditDivs).find(div => div.innerHTML.trim() === '');
  
            // If an empty div is found, insert an image into it
            if (firstEmptyDiv) {
                firstEmptyDiv.innerHTML = `<img src="${data.photoUrl}" class='image-participant' alt="Some Image" style='width: 60px;height: 60px;' data-username='${data.username}' >  `;
            }

            getTournamentParticipantCount(this.tournamentName).then(res => {
              if(res == 8 && this.index == 8)
              {
                    generateTournamentMatches(this.tournamentName).then(res => {
                      console.log(res);
                      if (res && res.matches) {
                        let matchIndex = 1;
                        res.matches.forEach(match => {
        
                          const matchDiv = document.getElementById(`match${matchIndex}`);
        
                          if (matchDiv) {
                              // Assuming match.player1 and match.player2 are objects with 'username' and 'avatar_url' properties
                              const player1Avatar = matchDiv.querySelector('#player1-avatar');
                              const player2Avatar = matchDiv.querySelector('#player2-avatar');
                              const player1Username = matchDiv.querySelector('#player1-username');
                              const player2Username = matchDiv.querySelector('#player2-username');
              
                              if (player1Avatar && player2Avatar && player1Username && player2Username) {
                                player1Avatar.innerHTML = `<img src="${match.player1_details.avatar_url}" alt="${match.player1_details.username}'s avatar" style='width: 60px; height: 60px;'>`;
                                player2Avatar.innerHTML = `<img src="${match.player2_details.avatar_url}" alt="${match.player2_details.username}'s avatar" style='width: 60px; height: 60px;'>`;
            
                                // Update the text content for usernames
                                player1Username.textContent = match.player1_details.username;
                                player2Username.textContent = match.player2_details.username;
                              }
                              
                              console.log(`Match ${matchIndex} between:`, match.player1_details.username, "and", match.player2_details.username);
                            // Additional processing for each match can be done here.
                            }
                          console.log("match " + match);
                          console.log("index " + matchIndex);
                          matchIndex++;
                        
                          });
                        
                    } else {
                        console.log("No matches found or an error occurred.");
                    }
                      


                  }).catch(error => {
                      console.error("Error generating matches:", error);
                  });
              }

              if(res == 8 && this.index  != 8)
              {
                  retrieveMatchesForTournament(this.tournamentName).then(res => {
                    console.log(res);
                    if (res && res) {
                      let matchIndex = 1;
                      res.forEach(match => {
      
                        const matchDiv = document.getElementById(`match${matchIndex}`);
      
                        if (matchDiv) {
                            // Assuming match.player1 and match.player2 are objects with 'username' and 'avatar_url' properties
                            const player1Avatar = matchDiv.querySelector('#player1-avatar');
                            const player2Avatar = matchDiv.querySelector('#player2-avatar');
                            const player1Username = matchDiv.querySelector('#player1-username');
                            const player2Username = matchDiv.querySelector('#player2-username');
            
                            if (player1Avatar && player2Avatar && player1Username && player2Username) {
                              player1Avatar.innerHTML = `<img src="${match.player1_details.avatar_url}" alt="${match.player1_details.username}'s avatar" style='width: 60px; height: 60px;'>`;
                              player2Avatar.innerHTML = `<img src="${match.player2_details.avatar_url}" alt="${match.player2_details.username}'s avatar" style='width: 60px; height: 60px;'>`;
          
                              // Update the text content for usernames
                              player1Username.textContent = match.player1_details.username;
                              player2Username.textContent = match.player2_details.username;
                            }
                            
                            console.log(`Match ${matchIndex} between:`, match.player1_details.username, "and", match.player2_details.username);
                          // Additional processing for each match can be done here.
                          }
                        console.log("match " + match);
                        console.log("index " + matchIndex);
                        matchIndex++;
                      
                        });
                      
                  } else {
                      console.log("No matches found or an error occurred.");
                  }
                    


                }).catch(error => {
                    console.error("Error generating matches:", error);
                });
              }
                   

            });
          }
          

          if(data.status == 'left')
          {
            const selector = `.image-participant[data-username='${data.username}']`;
            const elements = document.querySelectorAll(selector);
            console.log(elements);
            elements.forEach(el => el.remove()); 
              console.log(data);
          }

          
          // Handle incoming messages
      }

    onWebSocketError(event) {
        console.error("WebSocket error observed:", event);
    }

    onWebSocketClose(event) {
        console.log("WebSocket connection closed:", event);
        
       
    }

    closeWebSocket() {
      if (this.websocket) {

          leaveTournament(this.tournamentName).then(res => {
            console.log(res);
        });
          this.websocket.close();
          this.websocket = null; // Clear the reference
          console.log('socket closed');
          window.removeEventListener('beforeunload', this.handleBeforeUnload);
      }
    }

    async getProfileData() {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/user/`+this.username, {
                credentials: 'include' // Include cookies for authentication
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

  

    ListParticipant()
    {
     

            checkUserParticipation(this.tournamentName).then(res => {
            if(res == false)
            {
              console.log('check');
             navigateTo('/home');
               console.log('Get out like bayer munich 3-0');
               return;
            }
            
            ListParticipantTournament(this.tournamentName).then(res => {
              console.log("test " + res.length);
              this.index = res.length + 1;
              
              const canditDivs = document.querySelectorAll('.candit');
            
              res.forEach((data, index) => {
                if (index < canditDivs.length) {
                    canditDivs[index].innerHTML = `<img src="${data.participant_avatar_url}"  class='image-participant' alt="Participant Image" style='width: 60px; height: 60px;' data-username='${data.participant_username}'>`;
                }
            });
  
          
  
            if(!this.firstLoad)
               this.initWebSocket();
            
            });
         });
      
          // Loop through the response records and fill the candit divs
          
          
          // this.participantsLoaded = true;
          // Additional logic if needed

      // const data = await ListParticipantTournament(this.tournamentName);

    }
    
    async getHtml() {
       console.log(this.tournamentName);
       console.log('test');
      


       loadCSS('/css/tournament.css','tournament');
       removeCSS('profile');
       // const profileData = await this.getProfileData();
        return  /*html*/`

        <div class="main-container">
        <div class="frame">
          <div class="frame-1" id="match1">
            <div class="rectangle"></div>
            <button class="frame-2">
              <span class="game-in-progress">Game in Progress...</span>
            </button>
            <div class="frame-3">
              <div class="rectangle-4" id="player1-avatar"></div>
              <div class="frame-5"><span class="vs">VS</span></div>
              <div class="rectangle-6" id="player2-avatar"></div>
            </div>
            <button class="frame-7"><span class="guest" id="player1-username">Guest</span></button
            ><button class="frame-8"><span class="guest-9" id="player2-username">Guest</span></button>
          </div>
          <div class="frame-a" id="match2">
            <div class="rectangle-b"></div>
            <button class="frame-c">
              <span class="game-in-progress-d">Game in Progress...</span>
            </button>
            <div class="frame-e">
              <div class="rectangle-f" id="player1-avatar"></div>
              <div class="frame-10"><span class="vs-11">VS</span></div>
              <div class="rectangle-12" id="player2-avatar"></div>
            </div>
            <button class="frame-13"><span class="guest-14" id="player1-username">Guest</span></button
            ><button class="frame-15"><span class="guest-16"  id="player2-username">Guest</span></button>
          </div>
          <div class="frame-17" id="match3">
            <div class="rectangle-18"></div>
            <button class="frame-19">
              <span class="game-in-progress-1a">Game in Progress...</span>
            </button>
            <div class="frame-1b">
              <div class="rectangle-1c" id="player1-avatar"></div>
              <div class="frame-1d"><span class="vs-1e">VS</span></div>
              <div class="rectangle-1f" id="player2-avatar"></div>
            </div>
            <button class="frame-20"><span class="guest-21" id="player1-username" >Guest</span></button
            ><button class="frame-22"><span class="guest-23" id="player2-username">Guest</span></button>
          </div>
          <div class="frame-24" id="match4">
            <div class="rectangle-25"></div>
            <button class="button">
              <span class="game-in-progress-26">Game in Progress...</span>
            </button>
            <div class="frame-27">
              <div class="rectangle-28" id="player1-avatar"></div>
              <div class="frame-29"><span class="vs-2a">VS</span></div>
              <div class="rectangle-2b" id="player2-avatar"></div>
            </div>
            <button class="button-2c"><span class="guest-2d" id="player1-username">Guest</span></button
            ><button class="button-2e">
              <span class="guest-2f" id="player2-username">Guest</span>
            </button>
          </div>
        </div>
        <div class="frame-30">
          <div class="frame-31">
            <div class="rectangle-32"></div>
            <button class="button-33">
              <span class="game-in-progress-34">Game in Progress...</span></button
            ><button class="button-35">
              <span class="ael-beka">ael-beka</span></button
            ><button class="button-frame">
              <span class="ael-beka-36">ael-beka</span>
            </button>
            <div class="frame-37">
              <div class="rectangle-38"></div>
              <div class="frame-39"></div>
              <span class="vs-3a">VS</span>
              <div class="rectangle-3b"></div>
            </div>
          </div>
          <div class="frame-3c">
            <div class="rectangle-3d"></div>
            <button class="button-frame-3e">
              <span class="game-in-progress-3f">Game in Progress...</span></button
            ><button class="button-frame-40">
              <span class="ael-beka-41">ael-beka</span></button
            ><button class="button-frame-42">
              <span class="ael-beka-43">ael-beka</span>
            </button>
            <div class="frame-44">
              <div class="rectangle-45"></div>
              <div class="frame-46"></div>
              <span class="vs-47">VS</span>
              <div class="rectangle-48"></div>
            </div>
          </div>
        </div>
        <div class="champ"><div class="group"></div></div>
        <div class="component"></div>
        <div class="c"></div>
        <div class="frame-49">
          <div class="rectangle-4a"></div>
          <div class="frame-4b">
            <span class="awaiting-players">Awaiting Players...</span>
          </div>
          <button class="frame-4c"><span class="bayern">bayern</span></button>
          <div class="frame-4d"></div>
          <div class="frame-4e">
            <div class="rectangle-4f"></div>
            <div class="frame-50"><span class="vs-51">VS</span></div>
            <div class="rectangle-52"></div>
            <div class="frame-53"><span class="unknown">?</span></div>
          </div>
        </div>
        <div class="component-54"></div>
      </div>
      <div class="container box-players">
        <div class="row in-Q">Players in Quee</div>
        <div class="row box-quee">
        <div class="col candit" id="candit">
           
        </div>
        <div class="col candit" id="candit">
           
        </div>
        <div class="col candit" id="candit">
           
        </div>
        <div class="col candit" id="candit">
           
        </div>
        <div class="col candit" id="candit">
           
        </div>
        <div class="col candit" id="candit">
           
        </div>
        <div class="col candit" id="candit">
           
        </div>
        <div class="col candit" id="candit">
           
        </div>
     
    
        </div>
      </div>
        `;
    }
}

//   
function loadCSS(url,id) {
    const link = document.createElement('link');
    link.href = url;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.id = id;
    document.head.appendChild(link);
  }


  function removeCSS(id) {
    const linkElement = document.getElementById(id);
    if (linkElement) {
      document.head.removeChild(linkElement);
    }
  }