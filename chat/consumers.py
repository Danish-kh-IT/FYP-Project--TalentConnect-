import json
from typing import Any, Dict, List

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User

from .models import ChatThread, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self) -> None:
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return

        self.thread_id = int(self.scope["url_route"]["kwargs"]["thread_id"])
        self.room_group_name = f"chat_{self.thread_id}"

        if not await self._user_in_thread(user.id):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        history = await self._get_recent_messages()
        for message in history:
            await self.send(text_data=json.dumps(message))

    async def disconnect(self, close_code: int) -> None:
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data: str | bytes | bytearray) -> None:
        data = json.loads(text_data)
        message_type = data.get("type", "message")
        
        if message_type == "typing":
            # Handle typing indicator
            sender: User = self.scope["user"]
            is_typing = data.get("typing", False)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing.indicator",
                    "username": sender.username,
                    "typing": is_typing,
                },
            )
            return
        
        # Handle regular message
        raw_message = data.get("message", "").strip()
        if not raw_message:
            return

        sender: User = self.scope["user"]
        saved_message = await self._persist_message(sender, raw_message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "payload": saved_message,
            },
        )

    async def chat_message(self, event: Dict[str, Any]) -> None:  # pragma: no cover - invoked by Channels
        await self.send(text_data=json.dumps(event["payload"]))
    
    async def typing_indicator(self, event: Dict[str, Any]) -> None:  # pragma: no cover - invoked by Channels
        # Don't send typing indicator to the sender
        if event["username"] != self.scope["user"].username:
            await self.send(text_data=json.dumps({
                "type": "typing",
                "username": event["username"],
                "typing": event["typing"],
            }))

    @database_sync_to_async
    def _user_in_thread(self, user_id: int) -> bool:
        return ChatThread.objects.filter(id=self.thread_id, participants__id=user_id).exists()

    @database_sync_to_async
    def _get_recent_messages(self) -> List[Dict[str, Any]]:
        messages = (
            Message.objects.filter(thread_id=self.thread_id)
            .select_related("sender")
            .order_by("-created_at")[:50]
        )
        payload: List[Dict[str, Any]] = []
        for message in reversed(list(messages)):
            payload.append(
                {
                    "id": message.id,
                    "content": message.content,
                    "created_at": message.created_at.isoformat(),
                    "sender_username": message.sender.username,
                }
            )
        return payload

    @database_sync_to_async
    def _persist_message(self, sender: User, content: str) -> Dict[str, Any]:
        thread = ChatThread.objects.prefetch_related("participants").get(pk=self.thread_id)
        receiver = thread.other_participant(sender)
        message = Message.objects.create(
            thread=thread,
            sender=sender,
            receiver=receiver,
            content=content,
        )
        thread.save(update_fields=["updated_at"])

        return {
            "id": message.id,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
            "sender_username": sender.username,
        }
