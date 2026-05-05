from django.db import models
from django.contrib.auth.models import User


class ChatThreadQuerySet(models.QuerySet):
    def for_users(self, user_one: User, user_two: User) -> "ChatThreadQuerySet":
        return (
            self.filter(participants=user_one)
            .filter(participants=user_two)
            .distinct()
        )


class ChatThread(models.Model):
    participants = models.ManyToManyField(User, related_name="chat_threads")
    job = models.ForeignKey('jobs.Job', on_delete=models.SET_NULL, null=True, blank=True, related_name="chat_threads")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ChatThreadQuerySet.as_manager()

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        users = ", ".join(self.participants.values_list("username", flat=True))
        return f"Thread #{self.pk} ({users})"

    @classmethod
    def get_or_create_for_users(cls, user_one: User, user_two: User, job=None) -> "ChatThread":
        if user_one == user_two:
            raise ValueError("ChatThread requires two distinct users.")

        existing_thread = cls.objects.for_users(user_one, user_two)
        if job:
            existing_thread = existing_thread.filter(job=job)
        
        thread = existing_thread.first()
        if thread:
            return thread

        thread = cls.objects.create(job=job)
        thread.participants.add(user_one, user_two)
        return thread

    def other_participant(self, user: User) -> User:
        return self.participants.exclude(pk=user.pk).get()


class Message(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.sender} → {self.receiver}: {self.content[:30]}"

    def mark_read(self) -> None:
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=["is_read"])
