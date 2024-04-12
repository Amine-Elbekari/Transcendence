from channels.generic.websocket import AsyncWebsocketConsumer
import json



class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_authenticated:
            self.group_name = f'notifications_{self.user.id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Function to send a notification message
    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event['message']))


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'pong_game'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'move_bat':
            await self.handle_move_bat(data)
        elif action == 'update_ball':
            await self.handle_update_ball(data)
        elif action == 'start_game':
            await self.handle_start_game(data)
        # Add other actions as needed

    async def handle_move_bat(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'action': 'move_bat',
                'bat': data['bat'],
                'position': data['position']
            }
        )

    async def handle_update_ball(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'action': 'update_ball',
                'position': data['position']
            }
        )

    async def handle_start_game(self, data):
        # Logic to start the game
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'action': 'start_game',
                # Other relevant game start information
            }
        )

    async def game_update(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps(event))


class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tournament_name = self.scope['url_route']['kwargs']['tournament_name']
        self.room_group_name = f'tournament_{self.tournament_name}'

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Broadcast that a new user has joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'message': f"{self.scope['user'].username} has joined the tournament.",
                'username':f"{self.scope['user'].username}",
                 'status':'joined',
                # 'username':self.scope['user'].username,
                "photoUrl":self.scope['user'].avatar_url
               
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'message': f"{self.scope['user'].username} has left the tournament.",
                'username':f"{self.scope['user'].username}",
                'status':'left',
                # 'username':self.scope['user'].username,
                "photoUrl":self.scope['user'].avatar_url
               
            }
        )



    # Receive message from WebSocket
    async def receive(self, text_data):
        print("Received text data:", text_data)  # Debugging line
        text_data_json = json.loads(text_data)

    # Receive message from room group and send it to WebSocket
    async def user_joined(self, event):
        message = event['message']
        status = event['status']
        photoUrl = event['photoUrl']
        username = event['username']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
             'status':status,
            'username':username,
             "photoUrl":photoUrl
        }))

   
    async def user_left(self, event):
        message = event['message']
        status = event['status']
        photoUrl = event['photoUrl']
        username = event['username']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'status':status,
             'username':username,
             "photoUrl":photoUrl
        }))

    async def broadcast_message(self, event):
        message = event['message']
       
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
        }))