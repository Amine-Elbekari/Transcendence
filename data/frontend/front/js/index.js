import { router, navigateTo } from './router.js';

  // Establish a WebSocket connection
//   const userStatusSocket = new WebSocket(
//     `ws://localhost:8000/ws/game/`
// );

// userStatusSocket.onmessage = function(e) {


//   // console.log('it works buster');
//     const data = JSON.parse(e.data);
//     console.log(data);
//     if (data.action === 'invitation_sent') {
//         // Handle invitation sent notification
//         console.log('Invitation sent by', data.details.sender);
//         showInvitationBox(data.from,data.details.invitation_id);
//     } else if (data.action === 'invitation_accepted') {
//         // Handle invitation acceptance notification
//         console.log('Your invitation was accepted by', data.details.receiver);
//         navigateTo('/game');
     
//     } else if (data.action === 'invitation_refused') {
//         // Handle invitation refusal notification
//         console.log('Your invitation was refused by', data.details.receiver);
//     }
   
// };

// userStatusSocket.onclose = function(e) {
//   console.error('User status socket closed unexpectedly');
// };

// function showInvitationBox(fromUser,invitation_id) 
// {
//     const invitationBox = document.createElement('div');
//     invitationBox.id = 'invitationBox';
//     invitationBox.innerHTML = `
//         <button id="acceptButton" data="${invitation_id}">Accept</button>
//         <button id="refuseButton" data="${invitation_id}">Refuse</button>
//     `;
//     document.body.appendChild(invitationBox);

//     const acceptButton = document.getElementById('acceptButton');
//     if (acceptButton) {

//             acceptButton .addEventListener('click', function() {
//                 acceptInvitation(invitation_id);
//                 navigateTo('/game');
//             });
        
//         }
// }






window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            const href = e.target.getAttribute("data-href");
            console.log(href);
            e.preventDefault();
            if (href) {
                navigateTo(href);
            }
        }
    });

    router();
    // checkToken();

});






