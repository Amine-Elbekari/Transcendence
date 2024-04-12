import Home from "./views/Home.js";
import Profile from "./views/Profile.js";
import Game from "./views/Game.js";
import NotFound from "./views/NotFound.js";
import Login from "./views/LoginView.js";
import Tournament from "./views/Tournament.js";
import { checkToken } from './api/apiService.js';
import { getCookie } from './utils/cookieUtils.js';
import { leaveTournament } from "./api/apiService.js";
import config from './config/config.js';


const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
let currentView = null;
let lastFullRoute = null;


const getParams = match => {
    if (!match || !match.result) {
        return {};
    }
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

export const navigateTo = url => {
    // console.log('url ' + url);
    if (url === lastFullRoute && url.startsWith('/tournament/')) {
        console.log('Navigated to the same tournament route twice:', url);
        // Handle the specific case here
    }

    history.pushState(null, null, url);
    lastFullRoute = url; // Update lastFullRoute after navigation
    router();
};


export const router = async () => {
    try 
    {
        const routes = [
            { path: "/home", view: Profile },
            { path: "/tournament/:name", view: Tournament },
            { path: "/game", view: Game },
            { path: "/404", view: NotFound },
            { path: "/login", view: Login }
        ];
        const potentialMatches = routes.map(route => {
            return {
                route: route,
                result: location.pathname.match(pathToRegex(route.path))
            };
        });

        if (currentView && currentView.closeWebSocket && currentView.checkLoad() ) {
            currentView.closeWebSocket();
        }

        let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);
       

        const isTokenValid = await checkToken();

       
           

        if ((!match && !isTokenValid)) {
        
            navigateTo('/404');
            return;
        }
     
        // console.log("from router " + isTokenValid);
        if (!isTokenValid && location.pathname !== '/login') {
            
            if(location.pathname != '/404')
            {
                navigateTo('/login');
                return;
            }
            
        }

        if(isTokenValid && location.pathname == '/login')
        {
            navigateTo('/home');
            return;
        }

        if(location.pathname == "/")
            navigateTo('/home');
        
        if (!match) {
            match = {
                route: { path: "/404", view: NotFound },
                result: [location.pathname]
            };
        }

      

        if (match) {
            // /home > current=home /tournament/x > 
           

            // if(currentView == null && isTokenValid && location.pathname.startsWith("/tournament/"))
            // {
            //     //console.log('hello brohter');
            //     alert("I catch you mother fucker");

            //     navigateTo('/home');


            //     leaveTournament(view.tournamentName).then(res => {
            //         console.log(res);
            //     });
            //     return;
            // }
            // console.log(currentView);
            const view = new match.route.view(getParams(match));
            currentView = view;
            
           
            
            document.querySelector("#app").innerHTML = await view.getHtml();

            view.init();

           
           
            if (match.route.path === "/home" 
                    || match.route.path == "/game"
                    || match.route.path == "/"
                    ) {
                attachProfileEventListeners();
            }

            if(match.route.path == '/login')
            {
                initLoginPage();
            }
               

            if(match.route.path == '/game')
            {
                insertAfterVideo();
                view.attachEventListeners();

                const cancelGame = document.getElementById('cancel-game');
                if(cancelGame)
                {
                    cancelGame.addEventListener('click', function() {
                        // window.location.href = '../home';
                        navigateTo('/profile/aniouar');
                    });
                }
        
                const retryGame = document.getElementById('retry-game');
                if(retryGame)
                {
                    retryGame.addEventListener('click', function() {
                        // window.location.href = '../home';
                        navigateTo('/profile/aniouar');
                    });
                }

            }
        }
    }
    catch (error) {
        console.error('Error during token validation:', error);
        // Handle error, maybe navigate to an error page or show a message
    }
};

function attachProfileEventListeners() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            const csrftoken = getCookie('csrftoken');  // Function to get CSRF token from cookies

            fetch(`${config.API_BASE_URL}/api/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear JWT cookie
                    document.cookie = 'jwt=; Max-Age=0; path=/; domain=localhost';
        
                    // Redirect to login or another appropriate page
                    // window.location.href = '/login';
                    navigateTo('/login');
                } else {
                    console.error('Logout failed');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
    const RequestGameButton = document.getElementById('RequestGameButton');
    if (RequestGameButton) {
        RequestGameButton.addEventListener('click', function() {
            const csrftoken = getCookie('csrftoken');  // Function to get CSRF token from cookies

            let receiverUsername = 'enja'; // Replace with the actual username
            // let data = JSON.stringify({ username: username });
            
            fetch(`${config.API_BASE_URL}/api/game/send_invitation/${receiverUsername}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include'
                // body: data, // Include data in the request body
            })
            .then(response => response.json())
            .then(data => {
                //if (data.success) {
                     //alert('Game waiting ....');
                     console.log('Game waiting ....');
                //} else {
                    //console.error('Logout failed');
                //}
            })
            .catch(error => console.error('Error:', error));
    });
   }
    const acceptButton = document.getElementById('acceptButton');
    if (acceptButton) {
        acceptButton .addEventListener('click', function() {
            // const csrftoken = getCookie('csrftoken');  // Function to get CSRF token from cookies

            // let receiverUsername = 'enja'; // Replace with the actual username
            // // let data = JSON.stringify({ username: username });
            
            // fetch(`http://localhost:8000/api/game/send_invitation/${receiverUsername}/`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'X-CSRFToken': csrftoken
            //     },
            //     credentials: 'include'
            //     // body: data, // Include data in the request body
            // })
            // .then(response => response.json())
            // .then(data => {
            //     //if (data.success) {
            //          //alert('Game waiting ....');
            //          console.log('Game waiting ....');
            //     //} else {
            //         //console.error('Logout failed');
            //     //}
            // })
            // .catch(error => console.error('Error:', error));
            console.log('here je suis la');
    });

    }


   
}

function initLoginPage() {
    const messages = ["Play with Bots !", "Invite your friends !", "Setup a tournament !"];
    let currentMessageIndex = 0;
    const messageElements = document.querySelectorAll('.custom-box .msg');

    function changeMessage() {
        messageElements.forEach(el => el.style.display = 'none');
        messageElements[currentMessageIndex].style.display = 'block';
        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
    }
    if(messageElements.length > 0)
    {
        changeMessage();
        setInterval(changeMessage, 2000);
    }
        

    // Attach event listeners if needed, e.g., for sign-in buttons
    // document.getElementById('signInWithIntra').addEventListener(...);
    // document.getElementById('signInWithGoogle').addEventListener(...);
}

function insertAfterVideo() {
    console.log('test');
    const gameContainerHTML = /*html*/`

        <div class="container-game" id="container-game">
                <img src="/assets/default_profile_pic.jpeg"
                            class="img-profile-game img-fluid rounded-circle" 
                            alt="User Avatar"
                            style="width: 80px; height: 80px;">
                <p class="player-a ">Player2<a href="#" id="addfriendlfet"></a></p>
                <p id="h-title-game" class="head-title">
                    <a href="../home" class="home-button-game" id="../home/"><i class="fa-solid fa-house"></i></a>
                    Online<span class="text-warning">&nbsp;Pong&nbsp;</span>Game
                    <a href="../home" class="home-button-game exit-button-game" id="exit-ingame"><i class="fa-solid fa-right-to-bracket"></i></a>
                </p>
                <p class="player-b ">Player1</p>
                    <img src="/assets/default_profile_pic.jpeg"
                                class="img-profile-game img-fluid rounded-circle" 
                                alt="User Avatar"
                                style="width: 80; height: 80px;">
            </div>

    `;
    const videoElement = document.getElementById('myyVideo');
    if (videoElement) {
        videoElement.insertAdjacentHTML('afterend', gameContainerHTML);
    }

}

