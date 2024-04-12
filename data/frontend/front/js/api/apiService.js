import { getCookie } from '../utils/cookieUtils.js';
import config from '../config/config.js';

export function checkToken() {
    const token = getCookie('jwt');
    let csrftoken = getCookie('csrftoken');

    const fetchCsrfToken = () => {
        return fetch(`${config.API_BASE_URL}/api/set-csrf/`, { credentials: 'include' })
            .then(() => {
                csrftoken = getCookie('csrftoken');
            });
    };

    const validateToken = () => {
        return fetch(`${config.API_BASE_URL}/api/validToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ token: token })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Token exists:', data.token_exists);
            // console.log('username:', data.username);

            if (data.token_exists) {
                const profileLink = document.querySelector('a[href="/profile"]');
                if (profileLink) {
                    profileLink.setAttribute('href', `/profile/${data.username}`);
                }
            }

            return data.token_exists;
        });
    };

    return new Promise((resolve, reject) => {
        if (!csrftoken) {
            fetchCsrfToken().then(validateToken).then(resolve).catch(reject);
        } else {
            validateToken().then(resolve).catch(reject);
        }
    });
}

export function refuseInvitation(invitationId) {
    const csrftoken = getCookie('csrftoken'); 

    fetch(`${config.API_BASE_URL}/api/refuse_invitation/${invitationId}/`,  {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Invitation refused', data);
            // Additional logic after refusing the invitation
        })
        .catch(error => console.error('Error:', error));
}


export function sendInvitation(receiverUsername) {
    const csrftoken = getCookie('csrftoken'); 
    fetch(`${config.API_BASE_URL}/api/game/send_invitation/${receiverUsername}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Invitation sent', data);
            // Additional logic after sending the invitation
        })
        .catch(error => console.error('Error:', error));
}

export function acceptInvitation(invitationId) {
    const csrftoken = getCookie('csrftoken'); 

    fetch(`${config.API_BASE_URL}/api/game/accept_invitation/${invitationId}/`,  {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Invitation accepted', data);
            // Additional logic after accepting the invitation
        })
        .catch(error => console.error('Error:', error));
}


export async function getTopRankedUsers() {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/users/`,
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



  export async function disableTwoFactorAuth() {
    let csrftoken = getCookie('csrftoken');
    fetch(`${config.API_BASE_URL}/api/disable-2fa/`, {
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
            console.log('2FA disabled successfully');
        } else {
            console.error('Failed to disable 2FA');
        }
    })
    .catch(error => console.error('Error:', error));
}

export async function check2faRequired() {
    try {
        const response = await fetch(`${config.API_BASE_URL}/api/check-2fa-required/`,{ credentials: 'include'});
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

export async function verify2FA(token,method) {
    const csrftoken = getCookie('csrftoken'); // Function to get CSRF token from cookies

    try {
        var endpoint = `${config.API_BASE_URL}/api/verify-21fa/`;             
        if(method == "2")
            endpoint = `${config.API_BASE_URL}/api/verify-2fa/`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            body: new URLSearchParams({'token': token}),
            credentials: 'include'  // Needed for including the session cookie
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        return responseText;
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        return null;
    }
}

export async function logoutTwoFactor() {
    const csrftoken = getCookie('csrftoken'); // Function to get CSRF token from cookies

    try {
      
        const response = await fetch(`${config.API_BASE_URL}/api/logoutTwoFactor/`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include'  // Needed for including the session cookie
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.json();
        return responseText;
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        return null;
    }
}


export async function fetchTournaments() 
{
    try {
        // Replace 'your_endpoint_url' with the actual URL of your endpoint
        const response = await fetch(`${config.API_BASE_URL}/api/tournaments/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include other headers as required, like authorization tokens
            }
        });

        if (!response.ok) {
            // Handle response errors
            const message = `An error has occurred: ${response.status}`;
            throw new Error(message);
        }

        const tournaments = await response.json();
        return tournaments; // This will be the list of tournaments
    } catch (error) {
        console.error('There was a problem with fetching tournaments:', error);
    }
}

export async function fetchUserMatches() {
    try {
        // Replace with your actual endpoint URL
        const url = `${config.API_BASE_URL}/api/api/user_matches/`;

        // Include the authentication token in the request headers
        // This token should be securely retrieved from your authentication flow

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include other headers as required, like authorization tokens
            },
            credentials: 'include' 
        });

        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const matches = await response.json();
        return matches; // The list of user matches
    } catch (error) {
        console.error('Error fetching user matches:', error);
    }
}


export async function createTournament(tournamentData) {
    try {
        const url = `${config.API_BASE_URL}/api/tournaments/`; // Replace with your actual endpoint URL
        const csrftoken = getCookie('csrftoken');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(tournamentData),
            credentials: 'include' 
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData);
            return errorData; // or handle error differently
        }

        const createdTournament = await response.json();
        console.log('Tournament created:', createdTournament);
        return createdTournament;
    } catch (error) {
        console.error('Error creating tournament:', error);
    }
}

export async function JoinToTournament(tournamentName) {
    try {

        const participantData = {
            tournament_name: tournamentName // Replace with the actual tournament name
        };
        const url = `${config.API_BASE_URL}/api/join_tournament/`; // Replace with your actual endpoint URL
        const csrftoken = getCookie('csrftoken');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(participantData),
            credentials: 'include' 
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData);
            return errorData; // or handle error differently
        }

        const createdTournament = await response.json();
        console.log('i joined :', createdTournament);
        return createdTournament;
    } catch (error) {
        console.error('i cant:', error);
    }
}


export async function ListParticipantTournament(tournamentName) {
    try {
        const url = `${config.API_BASE_URL}/api/tournament_participants/${encodeURIComponent(tournamentName)}/`; // Replace with your actual endpoint URL
        const csrftoken = getCookie('csrftoken');

        // Return the fetch promise directly
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include' 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
            throw error; // Rethrow the error for further handling
        });
    }
    catch (error) {
        console.error('Error in ListParticipantTournament:', error);
        throw error; // Rethrow the error
    }
}

export async function leaveTournament(tournamentName) {
    try {
        const csrftoken = getCookie('csrftoken');
        const url = `${config.API_BASE_URL}/api/tournament_left/${encodeURIComponent(tournamentName)}/`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Check if response has content
        if (response.status !== 204) {
            return response.json();
        } else {
            return { message: "Success, but no content" };
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


export async function checkUserParticipation(tournamentName) {
    try {
        const csrftoken = getCookie('csrftoken'); // Function to get CSRF token from cookies
        const url = `${config.API_BASE_URL}/api/user/check_participation/${encodeURIComponent(tournamentName)}/`; // Adjust the URL as needed

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include CSRF token if required
            },
            credentials: 'include' // Include cookies for authentication
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        return data.is_participant; // Return whether the user is a participant
    } catch (error) {
        console.error('Error:', error);
        // Handle or rethrow the error as needed
        throw error;
    }
}

export async function getTournamentParticipantCount(tournamentName) {
    try {
        const url = `${config.API_BASE_URL}/api/user/tournament_participant_count/${encodeURIComponent(tournamentName)}/`; // Adjust the URL as needed

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include cookies for authentication, if necessary
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        return data.participant_count; // Return the participant count
    } catch (error) {
        console.error('Error:', error);
        // Handle or rethrow the error as needed
        throw error;
    }
}

export async function generateTournamentMatches(tournamentName) {
    try {
        const csrftoken = getCookie('csrftoken'); // Function to get CSRF token from cookies
        const url = `${config.API_BASE_URL}/api/generate_matches_r1/${encodeURIComponent(tournamentName)}/`; // Adjust the URL as needed

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include CSRF token if your endpoint requires it
            },
            credentials: 'include' // Include cookies for authentication
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        return data; // Return the entire response data
    } catch (error) {
        console.error('Error:', error);
        // Handle or rethrow the error as needed
        throw error;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retrieveMatchesForTournament(tournamentName) {
    try {
        const url = `${config.API_BASE_URL}/api/user/retrieve_matches/${encodeURIComponent(tournamentName)}/`; // Replace with your actual API endpoint URL
        const csrftoken = getCookie('csrftoken'); // Replace with your method to get CSRF token
        await delay(500);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include CSRF token if required by your backend
            },
            credentials: 'include' // Include cookies for authentication
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json(); // Parse and return the JSON data
    } catch (error) {
        console.error('Error in retrieving matches:', error);
        throw error; // Rethrow the error for further handling
    }
}