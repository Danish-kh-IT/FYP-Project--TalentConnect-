from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatThread, Message
from users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender', 'receiver', 'created_at', 'is_read']

class ChatThreadSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = ChatThread
        fields = ['id', 'participants', 'job', 'job_title', 'created_at', 'updated_at', 'last_message', 'unread_count']
        
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(receiver=request.user, is_read=False).count()

class MessageCreateSerializer(serializers.ModelSerializer):
    thread_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Message
        fields = ['thread_id', 'content']
        
    def create(self, validated_data):
        thread_id = validated_data.pop('thread_id')
        content = validated_data.get('content')
        
        request = self.context.get('request')
        sender = request.user
        
        try:
            thread = ChatThread.objects.get(pk=thread_id, participants=sender)
        except ChatThread.DoesNotExist:
            raise serializers.ValidationError("Invalid thread or not a participant.")
            
        receiver = thread.participants.exclude(pk=sender.pk).first()
        if not receiver:
            raise serializers.ValidationError("No receiver found in thread.")
        
        # Update thread's updated_at
        thread.save()
            
        return Message.objects.create(
            thread=thread,
            sender=sender,
            receiver=receiver,
            content=content
        )
