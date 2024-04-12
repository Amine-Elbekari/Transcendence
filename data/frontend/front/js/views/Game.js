import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Game");
        this.gameSocket = new WebSocket('ws://localhost:8000/ws/pong/');

        this.gameSocket.onopen = function(e) {
            console.log("Connection established!");
        };

        this.gameSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            // Handle different types of messages
        };

        this.gameSocket.onclose = function(e) {
            console.error('WebSocket closed unexpectedly');
        };
    }

    async getHtml() {
        removeCSS('profile');
        loadCSS('/css/game_style.css','game');
        // loadJS('/assets/js/script.js')
        return /*html*/`
                <section >
                <div id="linebtw"></div>
                <div class="bat" id="left-bat"></div>
                <div class="bat" id="right-bat"></div>
                <div id="ball"></div>
            </section>
            
            <div class="game-score">
                <p id="game-score-player1">0</p>
                <p id="game-score-player2">0</p>
            </div>
            
            <div id="message-of-game">
            <p id="game-over-message">Game Over</p>
            <div id="game-winner">winner</div>
            <div id="game-over-bottuns">
                <p id="retry-game">Retry</p>
                <p id="cancel-game">Back</p>
            </div>
            </div>
            
            <div id="crono-b-rounds">
            <p id="notification">The game will start after</p>
            <p id="crono-br">3s</p>
            </div>
            
            <div id="choose-mode">
            <div id="play-online-game">Play Online</div>
            <div id="play-with-bot">Play with Bot</div>
            </div>
        `;
    }

    attachEventListeners() {
        // Event listener for 'play-with-bot'
        const playWithBot = document.getElementById('play-with-bot');
        if (playWithBot) {
            playWithBot.addEventListener('click', this.handlePlayWithBotClick);
        }
    
        // Event listener for 'play-online-game'
        const playOnlineGame = document.getElementById('play-online-game');
        if (playOnlineGame) {
            playOnlineGame.addEventListener('click', this.handlePlayOnlineGameClick);
        }
    
        // Event listener for 'background-image'
        const backgroundImage = document.getElementById('background-image');
        if (backgroundImage) {
            backgroundImage.ondragstart = function() { return false; };
        }

       
    }
    
    // Handlers for clicks
    handlePlayWithBotClick() {
        const chooseMode = document.getElementById('choose-mode');
        if (chooseMode) {
            chooseMode.style.display = "none";
        }
        BotGame();
    }
    
    handlePlayOnlineGameClick() {
        const chooseMode = document.getElementById('choose-mode');
        if (chooseMode) {
            chooseMode.style.display = "none";
        }
        two_players();
    }

   
    
    
}

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

  function loadJS(url, id) {
    // Check if the script is already loaded
    const existingScript = document.getElementById(id);
    if (existingScript) {
        // If the script already exists, you may choose to return or reload it
        return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.id = id;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
        console.log(`Script with ID ${id} loaded`);
        // You can add any desired onload event here
    };

    script.onerror = () => {
        console.error(`Error loading script with ID ${id}`);
        // Handle errors if the script fails to load
    };
}

function removeJS(id) {
    const scriptElement = document.getElementById(id);
    if (scriptElement) {
        document.body.removeChild(scriptElement);
    }
}


