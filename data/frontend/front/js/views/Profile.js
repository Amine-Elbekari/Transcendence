import AbstractView from "./AbstractView.js";
import {getTopRankedUsers,
        disableTwoFactorAuth,
        fetchTournaments,
        fetchUserMatches,
        createTournament,
        JoinToTournament,
                        } from "../api/apiService.js";
import { navigateTo } from "../router.js";
import { verify2FA } from "../api/apiService.js";
import config from '../config/config.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    // console.log(params.username);
    this.username = params.username; // Store the username parameter
    this.setTitle("Profile");
  }
  init()
  {
     this.topRandkedEvent();
     this.NotificationProfileEvent();
     this.SettingsEvent();
     this.initWebSocket();
     this.TournametBoxEvent();
     this.FreindListEvent();
     this.AiEventBox();
     this.EnableTwoFAButtonEvent();
     this.TournamentListBtnEvent();
     this.refreshTournamentBtnEvent();
     this.createTournamentBtnEvent();
     
  }

  initWebSocket() {
        this.userStatusSocket = new WebSocket(`wss://localhost/ws/game/`);
        console.log('hello');
        this.userStatusSocket.onmessage = (e) => this.handleWebSocketMessage(e);
        this.userStatusSocket.onclose = (e) => this.handleWebSocketClose(e);
    }

    handleWebSocketMessage(e) {
        const data = JSON.parse(e.data);
        console.log(data);

        switch (data.action) {
            case 'invitation_sent':
                console.log('Invitation sent by', data.details.sender);
                this.showInvitationBox(data.from, data.details.invitation_id);
                break;
            case 'invitation_accepted':
                console.log('Your invitation was accepted by', data.details.receiver);
                navigateTo('/game');
                break;
            case 'invitation_refused':
                console.log('Your invitation was refused by', data.details.receiver);
                break;
            // ... handle other actions ...
        }
    }

    handleWebSocketClose(e) {
        console.error('User status socket closed unexpectedly');
    }

    showInvitationBox(fromUser, invitation_id) {
        const invitationBox = document.createElement('div');
        invitationBox.id = 'invitationBox';
        invitationBox.innerHTML = `
            <button id="acceptButton" data="${invitation_id}">Accept</button>
            <button id="refuseButton" data="${invitation_id}">Refuse</button>
        `;
        document.body.appendChild(invitationBox);
    
        const acceptButton = document.getElementById('acceptButton');
        if (acceptButton) {
    
                acceptButton .addEventListener('click', function() {
                    acceptInvitation(invitation_id);
                    navigateTo('/game');
                });
            
            }
    }

    topRandkedEvent() {
        const flexColumnElement = document.querySelector('.flex-column');
        if (flexColumnElement) {
            flexColumnElement.addEventListener('click', event => {
                // console.log('here brother\n');
    
    
                const userDiv = event.target.closest('[data-username]');
    
                if (userDiv) {
                    const username = userDiv.getAttribute('data-username');
                    console.log(`Clicked on user: ${username}`);
                  
                    this.getProfileData(username).then(profileData => {
                        console.log(profileData);
                        // console.log(clickedProfileData);
                        const  randkedUserModel = `
                        <div style="color: whitesmoke;font-size: 18px;font-family: 'Ubuntu';letter-spacing: 12px;">Profile</div>
                        <div class="rectangle-user">
                        <img id="show_profile1" src="${profileData.avatar_url}" class="img-profile" alt="User Avatar" style="height:150px; width:150px; border-radius: 10px; cursor:pointer;">
                   </div>
                   <div class="buttons-req">
                   <button class=" button-user">
                      <div class="frame-1-user"> Add Friend</div>
                   </button>
                   <button class="button-user-2">
                        <div class="frame-1-user"> Request Game</div>
                   </button>
                   </div>
                   <div class="frame-2-user">
                      <div class="frame-3-user">
                         <span class="el-mehdi-nja-user">${profileData.first_name} ${profileData.last_name}</span
                            ><span class="enja-user">${profileData.username}</span>
                      </div>
                      <span class="online-user">Online</span>
                   </div>
                   <div class="frame-4-user">
                      <button class="button-5-user">
                         <div class="frame-6-user"><span class="wins">Wins</span></div>
                         <span class="zero-user">0</span>
                      </button
                         >
                      <button class="frame-7-user">
                         <div class="frame-8-user"><span class="loses-user">Loses</span></div>
                         <span class="zero-9-user">0</span>
                      </button
                         >
                      <button class="frame-a-user">
                         <div class="frame-b-user"><span class="rank-user">Rank</span></div>
                         <span class="zero-c-user">0</span>
                      </button>
                   </div>
                   <div class="button-frame-user">
                    <span class="match-history-user">Match History</span>
                   </div>
                   <div class="rectangle-d-user">
                        <div class="row profile-hist-stats">
                            <div class="col match-hist">Match</div>
                            <div class="col score-hist">Score</div>
                            <div class="col date-hist">Date</div>
                        </div>
                        <div class="container cont-profile-all-stats">
                            <div class="row profile-all-stats">
                                <div class="col profile-players" style="justify-content: left;">enja vs aniouar</div>
                                <div class="col profile-score">3 / 2</div>
                                <div class="col profile-date" style="justify-content: right;">07-03-2024</div>
                            </div>
                            <div class="row profile-all-stats">
                                <div class="col profile-players" style="justify-content: left;">enja vs aniouar</div>
                                <div class="col profile-score">3 / 2</div>
                                <div class="col profile-date" style="justify-content: right;">07-03-2024</div>
                            </div>
                        </div>
                   </div> `;

                

                   const overlay_tournament = document.getElementById('overlay_tournament');
           
                
                   const show_prf = document.getElementById('user-info');
                   
                   if (overlay_tournament)
                      {
                          overlay_tournament.addEventListener('click', function(){
               
                              if (overlay_tournament)
                              {
                                  overlay_tournament.style.display = 'none';
                                  show_prf.style.display = 'none';
                              }
                          });
                      }
                     
               
                      
                       show_prf.style.display = 'flex';
                       overlay_tournament.style.display = 'flex';
                      show_prf.innerHTML = randkedUserModel;
   
               
                    }).catch(error => {
                        console.error("Error fetching profile data:", error);
                    });
    
                
                } 
            
            
            });    
           
        }
    }
    


    NotificationProfileEvent()
    {
        const notif_box = document.getElementById('notif-box');
        const notif_button = document.getElementById('notif-btn');
        const overlay_tournament = document.getElementById('overlay_tournament');

        if (overlay_tournament)
        {
            overlay_tournament.addEventListener('click', function(){
 
                if (overlay_tournament)
                {
                    overlay_tournament.style.display = 'none';
                    notif_box.style.display = 'none';
                }
            });
        }
        if (notif_button)
        {
            notif_button.addEventListener('click', function(){
            
                if (notif_box)
                {
                    notif_box.style.display = 'flex';
                    overlay_tournament.style.display = 'flex';
                }

            });
        }
    }


    SettingsEvent()
    {
        const settings_btn = document.getElementById('btn-settings');
        const settings_pg = document.getElementById('settings-pg');
        const overlay_tournament = document.getElementById('overlay_tournament');
    

        if (overlay_tournament)
        {
            overlay_tournament.addEventListener('click', function(){
 
                if (overlay_tournament)
                {
                    overlay_tournament.style.display = 'none';
                    // alert('test');
                    settings_pg.style.display = 'none';
                }
            });
        }
        

        if (settings_btn)
        {
            settings_btn.addEventListener('click', function(){

            if (settings_pg)
            {
                settings_pg.style.display = 'flex';
                
                overlay_tournament.style.display = 'flex';
            }
            });
        }
    }

    TournametBoxEvent()
    {
        const overlay_tournament = document.getElementById('overlay_tournament');
        const tournament_box = document.getElementById('tournement_box');
        const show_tournement = document.getElementById('tournamentBtn');
        const buttons_box = document.getElementById('buttons_boxID');

        if (show_tournement)
        {
             show_tournement.addEventListener('click', function() {
    
                 if (tournament_box && overlay_tournament)
                 {
                     overlay_tournament.style.display = 'flex';
                     tournament_box.style.display = 'flex';
                 }
             });
        }
        if (overlay_tournament)
        {
            overlay_tournament.addEventListener('click', function(){
 
                if (overlay_tournament && tournament_box)
                {
                    overlay_tournament.style.display = 'none';
                    tournament_box.style.display = 'none';
                    // friends_list.style.display = 'none';
                    buttons_box.style.display = 'grid';
                }
            });
        }

    }

    FreindListEvent()
    {
        const friends_list =  document.getElementById('friends_listID');
        const buttons_box = document.getElementById('buttons_boxID');
        const expand_div = document.getElementById('expand');
        const overlay_tournament = document.getElementById('overlay_tournament');

        if (expand_div)
        {
            expand_div.addEventListener('click', function(){
               
                if (friends_list && buttons_box) {
                    friends_list.style.display = 'block';
                    overlay_tournament.style.display = 'flex';
                    buttons_box.style.display = 'none';
                }
            });
           
        }
        if (friends_list) {
            friends_list.addEventListener('click', function() {
    
                if (buttons_box) {
                    buttons_box.style.display = 'grid';
                }
                friends_list.style.display = 'none';
                overlay_tournament.style.display = 'none';
            });
        }
        if (overlay_tournament)
       {
           overlay_tournament.addEventListener('click', function(){

               if (overlay_tournament)
               {
                   overlay_tournament.style.display = 'none';
                   friends_list.style.display = 'none';
                   buttons_box.style.display = 'grid';
               }
           });
       }
    }

    AiEventBox()
    {
        const ai_game = document.getElementById('rectangle-5c-id');

        if (ai_game)
        {
            ai_game.addEventListener('click', function(){
                navigateTo('/game');
            });
        }
    }
    
 

    EnableTwoFAButtonEvent()
    {
        const TwoFAButton = document.getElementById('button-two-fa');
        let  imageTwoFa  = document.getElementById('image-two-fa');
       
        if (TwoFAButton)
        {

          
                TwoFAButton.addEventListener('click', function(){
                    const  textContentButton =  TwoFAButton.textContent.trim(); 
                    // enable_2fa().then(imageUrl => {
                        console.log(textContentButton);
                    if(textContentButton == 'Enable 2FA')
                    {

                        const max = 6;
                        // TwoFAButton.textContent = 'Disable 2FA';
                        
                        var LovelyHtml = `
                        <img class="lock-2f" id="image-two-fa" src="${config.API_BASE_URL}/api/enable-2fa/" style="padding:0px; ">
                            <label for="exampleInputEmail1" style="color: whitesmoke;font-size: smaller;"></label>
                            <input id="code" type="email"  maxlength="${max}" class="formcontrol" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter code" style="/* width: 122px; */">
                        `;

                        // Create a template element

                        
                        document.getElementById("settings-pg-twofa").innerHTML = LovelyHtml;
                        imageTwoFa  = document.getElementById('image-two-fa');
                        var counter = 0;
                        document.getElementById('code').addEventListener('input', async function(event) {
                            if(counter > event.target.value.length)
                                imageTwoFa.src = `${config.API_BASE_URL}/api/enable-2fa/`;

                            counter  = event.target.value.length;
                            if(event.target.value.length == 6)
                            {
                                const result = await verify2FA(event.target.value,"1");
                                if (result == "true") {
                                    // navigateTo('/profile/aniouar');
                                    console.log('he je suis la');
                                    //imageTwoFa.src = '/assets/shield.png';


                                    LovelyHtml = `
                                    <img class="lock-2f" id="image-two-fa" src="/assets/shield.png" style="padding:0px;">
                                    <button class="button-4-settings-pg" id="button-two-fa">
                                    <span class="enable-2fa-settings-pg">Disable 2FA</span>
                                    </button>`;
                                    document.getElementById("settings-pg-twofa").innerHTML = LovelyHtml;
                                    /*
                                    
                                          <button class="button-4-settings-pg" id="button-two-fa">
                                                 <span class="enable-2fa-settings-pg">Disable 2FA</span>
                                          </button>

                                    */
                                    //navigateTo('/home');
                                    // Handle successful 2FA verification
                                } else {
                                    console.log('Failed to verify 2FA');
                                    imageTwoFa.src = '/assets/shield-2.png';
                                   // document.getElementById('alert').textContent = 'Failed to verify 2FA';
                                    // Handle failed 2FA verification
   
                                }
                            }
                            

                            // Your code here. This will be executed every time the user types.
                        });

             
                    }
                    else if(textContentButton == 'Disable 2FA')
                    {
                        console.log('here body');
                        imageTwoFa.src = '/assets/unlock.png';
                        imageTwoFa.style.padding  = '10px';
                        TwoFAButton.textContent = 'Enable 2FA';
                        disableTwoFactorAuth().then(data => {console.log(data)});
                    }

                        // console.log('scannniiii ' + imageUrl);
                    // });
                });
          
        }

        
    }

    createTournamentBtnEvent()
    {
            let validated = false;
            const tournamentNameInput = document.getElementById('tournamentNameInput');
            const startTournament = document.getElementById("startTournament");

            const joinBtn = document.getElementById('JoinBtn');
            
            let tournamentName = "";
            if(tournamentNameInput)
            {
                
                //
                tournamentNameInput.addEventListener('input',function(event){
                    tournamentName = tournamentNameInput.value;
                    if(tournamentName.length <= 15  && tournamentName.length >= 4)
                    {
                    
                        validated = true;
                        startTournament.style.opacity = '1';
                        startTournament.style.cursor = 'pointer';
                        startTournament.classList.add('hover-effect');
                    }
                    else
                    {
                        startTournament.style.opacity = '0.4';
                        startTournament.style.cursor = 'auto';
                        validated = false;
                        startTournament.classList.remove('hover-effect');
                    }
                    
                });
            }
           
            if(startTournament)
            {
                startTournament.addEventListener('click', function(event) {

                    if(validated)
                    {
                        const newTournamentData = {
                            name: tournamentName,
                            start_date: '2023-01-01',
                            end_date: '2023-01-15',
                            is_active: true
                            // Include other necessary fields as per your model
                        };
                        createTournament(newTournamentData).then(res => {
                            console.log(res);
                        });
                        JoinToTournament(tournamentName).then(res => {
                            // message from past control this by checking the res dont be lazy boy
                            console.log(res);
                            //navigateTo('/tournament');
                        });
                        navigateTo('/tournament');
                    }
            });
            }

            if(joinBtn)
            {
                joinBtn.addEventListener('click',function(event)
                {
                    const tournamentName = joinBtn.getAttribute('data-tournament');
                   // console.log(tournamentName);
                    console.log('shit ' + tournamentName +' ' + tournamentName.length);
                    JoinToTournament(tournamentName).then(res => {
                        // message from past control this by checking the res dont be lazy boy
                       // console.log(res);
                        navigateTo('/tournament/'+tournamentName);
                    });
                });
            }
            //
            

    }

    refreshListTournament(mod)
    {
        fetchTournaments().then(tournaments => {
            if (tournaments) {

            const tournementList = tournaments.map(tournament => {

                return `<div class="frame-2-tournament" id="TournamentDiv" data-name="${tournament.name}" style="cursor: pointer;">
                            <span class="bundesliga-tournament">${tournament.name}</span>
                            <span class="slash-tournament">${tournament.participant_count}/8</span>
                            <button class="aniouar-tournament">${tournament.creator_username}</button>
                        </div>`
            }).join('');
            
            const tournementListContainer = document.getElementById('tournement-list');
            tournementListContainer.innerHTML = tournementList;
         

           
         

                    const joinBtn = document.getElementById('JoinBtn');
                    joinBtn.classList.remove('hover-effect-join');
                    joinBtn.style.cursor = 'auto';
                    joinBtn.style.opacity = '0.4';
                    console.log('shity');

                    const allTournamentDivs = tournementListContainer.querySelectorAll('.frame-2-tournament');
                    allTournamentDivs.forEach(div => {
                        div.addEventListener('mouseenter', function() {
                            if(this.style.backgroundColor != 'gray')
                                this.style.backgroundColor = '#68686861'; // Example effect

                        });
                    
                        div.addEventListener('mouseleave', function() {
                            // Logic for mouseleave event
                          
                            if(this.style.backgroundColor != 'gray')
                                this.style.backgroundColor = '#68686826'; // Resetting the effect
                        });
                    });
                
                 //
                 if(mod == 0)
                 {
                    const tournementListContainers = document.getElementById('tournement-list');
                    tournementListContainers.addEventListener('click', function(event) {
                            
                        console.log('from mod fela7 ' + mod);
                        const tournamentDiv = event.target.closest('.frame-2-tournament');
                        const allTournamentDivss = tournementListContainer.querySelectorAll('.frame-2-tournament');                
                    

                        if (tournamentDiv) {

                            allTournamentDivss.forEach(div => {
                        
                                div.style.background = '#68686826';
                                
                            

                        
                            });
                            
                            // Get tournament name or any other relevant data
                            const tournamentName = tournamentDiv.getAttribute('data-name');
                        
                            console.log('Tournament clicked:', tournamentName);
                            // Add your logic here to handle the tournament click

                            tournamentDiv.style.background = 'gray';

                            if (joinBtn) {
                                joinBtn.setAttribute('data-tournament', tournamentName);
                                joinBtn.style.opacity = '1';
                                joinBtn.style.cursor = 'pointer';
                                joinBtn.classList.add('hover-effect-join');
                            }
                        }
                    
                    });
                 }
                        

                        // isolate this shit
                   

                }
                // console.log('Tournaments:', tournaments);
                // Handle the tournament data (e.g., display it in the UI)
            // }


        });



    }

    TournamentListBtnEvent()
    {
        const self = this;
        const tournamentBtn = document.getElementById('tournamentBtn');
        if(tournamentBtn)
        {
            tournamentBtn.addEventListener('click', function(){
                self.refreshListTournament(0);
            });
        }
    }


    refreshTournamentBtnEvent()
    {
        const self = this;
        const RefBtn = document.getElementById('RefBtn');
        if(RefBtn)
        {
            RefBtn.addEventListener('click',function(){
                
                // console.log('test');
                self.refreshListTournament(1);
            });
        }
    }

  async getProfileData(username) {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/user/` + username,
        {
          credentials: "include", // Include cookies for authentication
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  async getMe() {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/me/`,
        {
          credentials: "include", // Include cookies for authentication
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }



  async getHtml() {
    var i = -1;
    //removeBeforeUnloadEvent();
    removeCSS('tournament');
    loadCSS("/css/profile-style.css", "profile");
    removeGameHeader();
    const profileData = await this.getMe();
    console.log(profileData);
    const topRandkedUsersData = await getTopRankedUsers();
    // const fetchUserMatchesData = await fetchUserMatches();

    // console.log(fetchUserMatchesData);
    // console.log(topRandkedUsersData);


        var string = ["/assets/gold-star.png", "/assets/silver-star.png", "/assets/bronz-star.png"];
        
    // Dynamically create HTML for each top ranked user
    const topUsersHtml = topRandkedUsersData.map(user => {
        i++;
        if (i < 3)
        {
                 return `
                     <div class="frame-2b" id="show_profile" style="cursor:pointer"  data-username='${user.username}'>
                         <div class="star">
                         <img src="${string[i]}" style="width: 24px;height: 24px;">
                         </div>
                         <div class="rectangle-26"></div>
                         <span class="el-mehdi-nja-2d">${user.username}</span>
                         <span class="zero">0</span>
                     </div>
                 `;
        }
        else{
                 return `
                 <div class="frame-2b" id="show_profile" style="cursor:pointer"  data-username='${user.username}'>
                     <div class="rectangle-26"></div>
                     <span class="el-mehdi-nja-2d">${user.username}</span>
                     <span class="zero">0</span>
                 </div>
        `;
        }
    }).join('');

    
    var twoFactorBlock;
    if(!profileData.qr_code_data)
    {
        twoFactorBlock =  `<img class="lock-2f" id="image-two-fa" src="/assets/unlock.png" >
        <button class="button-4-settings-pg" id="button-two-fa">
        <span class="enable-2fa-settings-pg">Enable 2FA</span>
        </button>`;
    }
    else
    {
        twoFactorBlock =  `<img class="lock-2f" id="image-two-fa" src="/assets/shield.png" style="padding:0px;">
        <button class="button-4-settings-pg" id="button-two-fa">
        <span class="enable-2fa-settings-pg">Disable 2FA</span>
        </button>`;
    }
       

    return /*html*/ `
    <div class="main-container" id="release">
    <div class="flex-row-bd">
        <button class="rectangle">
        <span class="profile-stats">Profile Stats</span></button>
        <div class="rectangle-1">
            <span class="top-players">Top 10 Players</span>
        </div>
        <button class="rectangle-2">
        <span class="match-history">Match History</span>
        </button>
    </div>
    <div class="frame">
        <div class="rectangle-3"></div>
        <button class="rectangle-4"></button><button class="rectangle-5"></button><button class="rectangle-6"></button><span class="matches">Matches</span><span class="score">Score</span><span class="dates">Dates</span>
        <div class="frame-7">
            <button class="frame-8">
            <span class="enja-vs-amine">Enja vs Amine </span><span class="result">3-2</span><span class="date">2024-02-28</span></button>
        </div>
    </div>
    <div class="frame-19">
        <div class="rectangle-1a">
            <img id="show_profile1" src="${profileData.avatar_url}" class="img-profile" alt="User Avatar" style="height:170px; width:170px; border-radius: 10px; cursor:pointer;">
        </div>
        <div class="frame-1b">
            <span id="show_profile2"  class="el-mehdi-nja" style="cursor:pointer;" >${profileData.first_name} ${profileData.last_name}</span><span id="show_profile3"  class="enja" style="cursor:pointer;">${profileData.username}</span>
        </div>
        <div class="rank">
            <span class="r">R</span><span class="ank">ANK 1</span>
        </div>
        <button class="ellipse-1c"  data-info="Settings" id="btn-settings" >
        <img class="settings-img"src="/assets/16aa336c-3aa7-4259-8508-1f1caf1c545c.png" style="width: 30px;height: 30px;">
        </button>
        <button class="ellipse" data-info="Notifications" id="notif-btn">
        <img class="settings-img"  src="/assets/84e94635-1cc3-45f8-a2c8-d347ea8e5640.png" style="width: 26px;height: 26px;">
        </button>
        <button class="ellipse-1d" data-info="Logout" id="logoutButton">
        <img class="settings-img" src="/assets/7d76e907-16a6-4c1c-9bc7-b587b9cf26b4.png" style="width: 30px;height: 30px;">
        </button>
    </div>
    <div class="frame-1e">
        <div class="col head-txt-2">
            <div class="box h-txt">
                <div class="word-reveal">
                    <p id="masked-word" class="masked-word">Online <span class="moving-I">|</span><span class="bouncing-dot">·</span></p>
                    <span class="pong-word">Pong</span>
                    <div class="word-reveal">
                        <p id="masked-word" class="masked-word"><span class="moving-I">|</span><span class="bouncing-dot">·</span> Game</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-column">
          ${topUsersHtml}
        </div>
    </div>
    <div class="rectangle-5a" id="buttons_boxID">
        <div class="rectangle-5b" id="expand">
            <img class="play-img" src="/assets/play-with-friend.png">
            <span class="play-with-friends">Play With Friends</span>
        </div>
        <div class="rectangle-5c" id="rectangle-5c-id">
            <span class="play-with-bot-ai">Play With BotAI</span>
            <img class="play-img" src="/assets/robot.png">
        </div>
        <div class="rectangle-5d" id="tournamentBtn">
            <span class="pong-champion">Play a Tournement</span>
            <img class="play-img" src="/assets/tournament.png">
        </div>
    </div>
    <div class="rectangle-5a-2">
        <div class="frame-67-2">
            <div class="frame-67"><span class="total-games">Total Games</span></div>
            <button class="rectangle-66"></button>
            <div class="frame-68"><span class="zero-69">0</span></div>
        </div>
        <div class="frame-67-3">
            <div class="frame-67"><span class="total-games">Total Games</span></div>
            <button class="rectangle-66"></button>
            <div class="frame-68"><span class="zero-69">0</span></div>
        </div>
        <div class="frame-67-4">
            <div class="frame-67"><span class="total-games">Total Games</span></div>
            <button class="rectangle-66"></button>
            <div class="frame-68"><span class="zero-69">0</span></div>
        </div>
        <div class="frame-67-5">
            <div class="frame-67"><span class="total-games">Total Games</span></div>
            <button class="rectangle-66"></button>
            <div class="frame-68"><span class="zero-69">0</span></div>
        </div>
    </div>
</div>
</div>
</div>
<div id="overlay_tournament">click every where to go back</div>


<div class="container msg-box" id="notif-box">
    <div class="row msg-title">Notifications</div>
    <div class="row-md-1 msg-box-notifications">
        <div class="box box-notif">enja sent u freind request, accept?</div>
        <div class="answer_buttons">
            <button class="accept_btn">Accept</button>
            <button class="refuse_btn">Refuse</button>
        </div>
    </div>
    <div class="row-md-1 msg-box-notifications">
    <div class="box box-notif">anioarrr sent u freind request, accept?</div>
    <div class="answer_buttons">
        <button class="accept_btn">Accept</button>
        <button class="refuse_btn">Refuse</button>
    </div>
</div>
</div>


<div class="main-container-settings-pg" id="settings-pg">
  <div class="col frame-1-wraping">
   <div class="frame-1-settings-pg">
      <div class="rectangle-settings-pg">
      <img id="show_profile1" src="${profileData.avatar_url}" class="img-profile" alt="User Avatar" style="height:106px; width:106px; border-radius: 10px; cursor:pointer;">
      </div>
      <div class="frame-2-settings-pg">
         <span class="amine-el-bekari-settings-pg">Amine El bekari</span><span class="ael-beka-settings-pg">ael-beka</span>
      </div>
     </div>
        <button class="button-settings-pg">
        <span class="edit-picture-settings-pg">Edit Picture</span></button>
    </div>
   <div class="col frame-5-settings-pg">
        <div class="form-group" style="display: flex;gap: 10px;flex-direction: column;">
            <label for="exampleInputEmail1" style="color: whitesmoke;font-size: smaller;">Change Your Name</label>
            <input type="email" class="formcontrol" id="exampleInputEmail1" aria-describedby="emailHelp" value='${profileData.first_name} ${profileData.last_name}' placeholder="Enter Name">
        </div>
        <div class="form-group" style="display: flex;gap: 10px;flex-direction: column;width: 166px;">
            <label for="exampleInputEmail1" style="color: whitesmoke;font-size: smaller;">Change Your Username</label>
            <input type="email" class="formcontrol" id="exampleInputEmail1" aria-describedby="emailHelp" value='${profileData.username}'  placeholder="Enter Username" style="/* width: 122px; */">
            <small id="emailHelp" style="color: #a8a8a8;font-size: 12px;">8 charachters minimum and 15 maximum</small>
        </div>
        <div class="save_button">
            <button class="save_btn">SAVE</button>
        </div>
  </div>
   <div class="col frame-3-settings-pg" id="settings-pg-twofa">
     ${twoFactorBlock}
   </div>
</div>




<div class="main-container-user" id="user-info">
   
   
</div>


<div class="friends_bar" id="friends_listID"></div>


<div class="main-container-tournament" id="tournement_box">
    <div class="frame-1-tournament">
        <button class="button-tournament">
        <span class="tournament-tournament">Tournament Name</span>
        </button>
        <div class="frame-3-tournament">
            <span class="find-tournament-tournament">Find Tournement</span>
        </div>
        <button class="frame-4-tournament"><span class="players-tournament">Players</span></button
            ><button class="frame-5-tournament"><span class="owner-tournament">Owner</span></button>
      <div class="tournement-list" id="tournement-list"></div>
         <div class="btns-trm">
            <button class="btttn" id="JoinBtn" style="color: whitesmoke;opacity: 0.4;cursor: auto;bottom: 238px;">Join</button>
            <button class="btttn-refresh" id="RefBtn" style="color: whitesmoke; bottom: 238px;">Refresh</button>
        </div>
      </div>
    <div class="frame-6-tournament">
        <button class="button-7-tournament">
        <span class="create-tournament-tournament">Create Tournement</span>
        </button>
        <div class="frame-8-tournament" >
            <button class="rectangle-tournament" id="startTournament" style="opacity:0.4; cursor:auto;"><span class="start-tournament">Start</span></button>
            <div class="hold_tour_name">
                <label for="exampleInputEmail1" style="color: whitesmoke;font-size: smaller;"></label>
                <input class="button-9-tournament" placeholder="Tournement Name" 
                        id="tournamentNameInput" >
            </div>   
        </div>
        <small id="emailHelp" style="color: #a8a8a8;font-size: 12px;opacity: 0.7;">4 charachters minimum and 15 maximum</small>
    </div>

</div>
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

function removeGameHeader()
{
    const containerGame = document.getElementById('container-game');
    if(containerGame)
    {
        containerGame.style.display = 'none';
    }
}

function removeBeforeUnloadEvent() {
    loadEvent
}