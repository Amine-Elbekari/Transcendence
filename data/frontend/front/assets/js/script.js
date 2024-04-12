// ------------ Function for two players --------------

function two_players()
{
		let ball = document.getElementById("ball");
		let leftBat = document.getElementById("left-bat");
		let rightBat = document.getElementById("right-bat");
		//let BatWidth = rightBat.offsetWidth;
		let BatHeight = rightBat.offsetHeight;
		let BatSpeed = 50;
		let gameBox = document.getElementById("game-box");
		let boxWidth = gameBox.offsetWidth;
		let boxHeight = gameBox.offsetHeight;
		let ballX = boxWidth / 2;
		let ballY = boxHeight / 2;
		let ballSpeedX = -5;
		let ballSpeedY = 5;
		let intervalId;
		let currentRound = 0;
		let scorePlayer1 = 0;
		let scorePlayer2 = 0;

		Game.gameSocket.onmessage = function(e) {
			const data = JSON.parse(e.data);
			if (data.action === 'update_state') {
				ball.style.left = data.ball.x + 'px';
				ball.style.top = data.ball.y + 'px';
				if (data.bat === 'left') {
					leftBat.style.top = data.position + 'px';
				} else if (data.bat === 'right') {
					rightBat.style.top = data.position + 'px';
				}
			}
		};

		function delay(time) {
			return new Promise(resolve => setTimeout(resolve, time));
		}
		
		function ballPosition() {
	
			async function endofRound(winner) {
	
				let scoreofMatch = " - ";
				
				if (winner == 1) scorePlayer1++;
				else scorePlayer2++;
				
				scoreofMatch = scorePlayer1 + scoreofMatch + scorePlayer2;
				currentRound++;
				
				document.getElementById("game-score-player1").innerText = scorePlayer1;
				document.getElementById("game-score-player2").innerText = scorePlayer2;
				clearInterval(intervalId);
				// Check if maximum rounds have been played
				if (currentRound >= 3) {
					// Display game over logic
					document.getElementById('game-winner').innerText = "Player"+ winner + " Win\nScore : " + scoreofMatch;
					document.getElementById('message-of-game').style.display = "block";
					document.getElementById('message-of-game').style.justifyContent = "center";
					document.getElementById('message-of-game').style.alignItems = "center";
					// Show final scores and winner
				} else {
					// Reset for new round
					ballX = boxWidth / 2;
					ballY = boxHeight / 2;
					ballSpeedX = -10;
					ballSpeedY = 5;
					ball.style.left = ballX + "px";
					ball.style.top = ballY + "px";
					document.getElementById("crono-b-rounds").style.display = "block";
					for (let i = 0 ; i < 3; i++)
					{
						await delay(1000);
						document.getElementById("crono-br").innerText = (3 - i) + "s";
					}
					await delay(100);
					document.getElementById("crono-b-rounds").style.display = "none";
					document.getElementById("crono-br").innerText = "3s";
					intervalId = setInterval(ballPosition, 1000 / 60);
				}
			}
			
			ballX += ballSpeedX;
			ballY += ballSpeedY;
			if (ballX + ball.offsetWidth >= boxWidth) {
				if (ballY + ball.offsetHeight <= rightBat.offsetTop || ballY >= rightBat.offsetTop + BatHeight) {
					ball.style.left = (boxWidth - ball.offsetWidth) + "px";
					ball.style.top = ballY + "px";
					endofRound(1);
					return (1);
				}
			}
			else if ( ballX <= 0)
			{
				if (ballY + ball.offsetHeight <= leftBat.offsetTop || ballY >= leftBat.offsetTop + BatHeight) {
					ball.style.left = 0 + "px";
					ball.style.top = ballY + "px";
					endofRound(2);
					return (1);
				}
			}
			if (ballX + ball.offsetWidth >= boxWidth || ballX <= 0) {
				ballSpeedX *= -1;
				// if (ballX > 0)
				// 	ballSpeedY = (((ballY - rightBat.offsetTop) * (25 / BatHeight)) - 10);
				// else
				// 	ballSpeedY = (((ballY - leftBat.offsetTop) * (25 / BatHeight)) - 10);
			}
	
			if (ballY + ball.offsetHeight >= boxHeight || ballY <= 0) {
				ballSpeedY *= -1;
			}
	
			ball.style.left = ballX + "px";
			ball.style.top = ballY + "px";
			gameSocket.send(JSON.stringify({ action: "move_bat", bat: "left", position: leftBat.offsetTop }));
		}
	
	
		function moveLeftBat(e) {
			const key = e.key;
			if (key === "w")
			{
				if (leftBat.offsetTop - BatSpeed < 0)
					leftBat.style.top = 0 + "px";
				else
					leftBat.style.top = leftBat.offsetTop - BatSpeed + "px";
			}
			else if (key === "s")
			{
				if (leftBat.offsetTop + BatHeight + BatSpeed > boxHeight)
					leftBat.style.top = boxHeight - BatHeight  + "px";
				else
					leftBat.style.top = leftBat.offsetTop + BatSpeed + "px";
			}
		}
	
		function moveRightBat(e) {
			const key = e.key;
			if (key === "o" && rightBat.offsetTop > 0)
				rightBat.style.top = rightBat.offsetTop - BatSpeed + "px";
			else if (key === "l" && rightBat.offsetTop + BatHeight < boxHeight - 5)
				rightBat.style.top = rightBat.offsetTop + BatSpeed + "px";
			gameSocket.send(JSON.stringify({ action: "move_bat", bat: "right", position: rightBat.offsetTop }));
		}
	
		
		document.addEventListener("keydown", moveLeftBat);
		document.addEventListener("keydown",  moveRightBat);
	
	
	
	
		// mouse the bats with mouse
		dragBat(document.getElementById("left-bat"));
		dragBat(document.getElementById("right-bat"));
	
		function dragBat(elem) {
			var mouseA = 0, mouseB = 0;
			
			elem.onmousedown = dragMouseDown;
			
			function dragMouseDown(ev) {
				ev = ev || window.event;
				ev.preventDefault();
				
				mouseA = ev.clientY;
				
				document.onmouseup = leaveBat;
				
				document.onmousemove = Batdraging;
			}
			
			function Batdraging(ev) {
				ev = ev || window.event;
				ev.preventDefault();
	
				mouseB = ev.clientY - BatHeight - (BatHeight / 4);
	
				if (mouseB <= 0)
					mouseB = 0;
				else if (mouseB >= boxHeight - BatHeight)
					mouseB = boxHeight - BatHeight;
	
				elem.style.top = mouseB + "px";	
			}
			
			function leaveBat() {
				document.onmouseup = null;
				document.onmousemove = null;
			}
		}
	
	
		intervalId = setInterval(ballPosition, 1000 / 60);

}


// -------------- Function for playing with Bot -----------------

function BotGame()
{
		let ball = document.getElementById("ball");
		let leftBat = document.getElementById("left-bat");
		let rightBat = document.getElementById("right-bat");
		let BatWidth = rightBat.offsetWidth;
		let	BatHeight = rightBat.offsetHeight;
		let BatSpeed = 15;
		let gameBox = document.getElementById("game-box");
		let boxWidth = gameBox.offsetWidth;
		let boxHeight = gameBox.offsetHeight;
		let ballX = boxWidth / 2;
		let ballY = boxHeight / 2;
		let ballSpeedX = 8;
		let ballSpeedY = 7;
		let intervalId;
		let currentRound = 0;
		let scorePlayer1 = 0;
		let scorePlayer2 = 0;
		var nextBallY;
		var topBat;
		var	inPosition = 0;
		var speedx = ballSpeedX;
		var speedy = ballSpeedY;
		var	x , y;

		function delay(time) {
			return new Promise(resolve => setTimeout(resolve, time));
		}
		
		function ballPosition() {
	
			async function endofRound(winner) {
	
				let scoreofMatch = " - ";
				
				if (winner == 1) scorePlayer1++;
				else scorePlayer2++;
				
				scoreofMatch = scorePlayer1 + scoreofMatch + scorePlayer2;
				currentRound++;
				
				document.getElementById("game-score-player1").innerText = scorePlayer1;
				document.getElementById("game-score-player2").innerText = scorePlayer2;
				clearInterval(intervalId);
				// Check if maximum rounds have been played
				if (currentRound >= 3) {
					// Display game over logic
					document.getElementById('game-winner').innerText = "Player"+ winner + " Win\nScore : " + scoreofMatch;
					document.getElementById('message-of-game').style.display = "block";
					document.getElementById('message-of-game').style.justifyContent = "center";
					document.getElementById('message-of-game').style.alignItems = "center";

				
					// Show final scores and winner
				} else {
					// Reset for new round
					ballX = boxWidth / 2;
					ballY = boxHeight / 2;
					ballSpeedX =  8;
					ballSpeedY = 7;
					ball.style.left = ballX + "px";
					ball.style.top = ballY + "px";
					document.getElementById("crono-b-rounds").style.display = "block";
					for (let i = 0 ; i < 3; i++)
					{
						await delay(1000);
						document.getElementById("crono-br").innerText = (3 - i) + "s";
					}
					await delay(100);
					document.getElementById("crono-b-rounds").style.display = "none";
					document.getElementById("crono-br").innerText = "3s";
					intervalId = setInterval(ballPosition, 1000 / 80);
				}
			}
			
			ballX += ballSpeedX;
			ballY += ballSpeedY;
			if (ballX + ball.offsetWidth >= boxWidth) {
				if (ballY + ball.offsetHeight <= rightBat.offsetTop || ballY >= rightBat.offsetTop + BatHeight) {
					ball.style.left = (boxWidth - ball.offsetWidth) + "px";
					ball.style.top = ballY + "px";
					endofRound(1);
					return (1);
				}
			}
			else if ( ballX <= 0)
			{
				if (ballY + ball.offsetHeight <= leftBat.offsetTop || ballY >= leftBat.offsetTop + BatHeight) {
					ball.style.left = 0 + "px";
					ball.style.top = ballY + "px";
					endofRound(2);
					return (1);
				}
				// else
					// ballSpeedX *= -1;
			}

			function getNextBallY() {
				speedx = ballSpeedX;
				speedy = ballSpeedY;
				x = ballX;
				y = ballY;
				while (x > 0)
				{
					x += speedx;
					y += speedy;
					if (y + ball.offsetHeight >= boxHeight || y <= 0)
						speedy *= -1;
					if (x + ball.offsetWidth >= boxWidth || x <= 0)
						speedx *= -1;
				}
				nextBallY = y;
			}
			
			if (ballX + ball.offsetWidth >= boxWidth || ballX <= 0) {
				ballSpeedX *= -1;
				if (ballX > 0)
				{
					// if ((ballY >= rightBat.offsetTop && ballY <= rightBat.offsetTop + BatHeight)
					// 	&& ((ballY < rightBat.offsetTop + BatHeight / 3) || (ballY > rightBat.offsetTop + BatHeight - BatHeight / 3)))
					// 	ballSpeedY *= -1;
					getNextBallY();
					inPosition = 0;
				}

				// if (ballX > 0)
				// 	ballSpeedY = (((ballY - rightBat.offsetTop) * (25 / BatHeight)) - 10);
				// else
				// 	ballSpeedY = (((ballY - leftBat.offsetTop) * (25 / BatHeight)) - 10);
			}
			
	
			if (ballY + ball.offsetHeight >= boxHeight || ballY <= 0) {
				ballSpeedY *= -1;
			}
	
			ball.style.left = ballX + "px";
			ball.style.top = ballY + "px";


			topBat = nextBallY - (BatHeight / 2);
			if (ballX < boxWidth / 2 && ballSpeedX < 0 && inPosition == 0)
			{
				if ((leftBat.offsetTop - 4) > topBat && (leftBat.offsetTop - 4) >= 0)
					leftBat.style.top = (leftBat.offsetTop - 4) + "px";
				else if ((leftBat.offsetTop + 4) < topBat && (leftBat.offsetTop + 4) <= boxHeight - BatHeight)
					leftBat.style.top = (leftBat.offsetTop + 4) + "px";
				else
					inPosition = 1;
			}
		}
	
		// mouse the bats with mouse
		// dragBat(document.getElementById("left-bat"));
		dragBat(document.getElementById("right-bat"));
	
		function dragBat(elem) {
			var mouseA = 0, mouseB = 0;
			
			elem.onmousedown = dragMouseDown;
			
			function dragMouseDown(ev) {
				ev = ev || window.event;
				ev.preventDefault();
				
				mouseA = ev.clientY;
				
				document.onmouseup = leaveBat;
				
				document.onmousemove = Batdraging;
			}
			
			function Batdraging(ev) {
				ev = ev || window.event;
				ev.preventDefault();
	
				mouseB = ev.clientY - BatHeight - (BatHeight / 4);
	
				if (mouseB <= 0)
					mouseB = 0;
				else if (mouseB >= boxHeight - BatHeight)
					mouseB = boxHeight - BatHeight;
	
				elem.style.top = mouseB + "px";	
			}
			
			function leaveBat() {
				document.onmouseup = null;
				document.onmousemove = null;
			}
		}
		
		// document.addEventListener("keydown", moveRightBat);
	
		intervalId = setInterval(ballPosition, 1000 / 80);

}


// -------------- Call the function depend on the mode --------------

// Check for 'play-with-bot' element and add event listener
