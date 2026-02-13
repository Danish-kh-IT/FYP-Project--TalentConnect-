from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth.models import User
from .models import ChatThread, Message
from .serializers import ChatThreadSerializer, MessageSerializer, MessageCreateSerializer

class ChatThreadViewSet(viewsets.ModelViewSet):
    queryset = ChatThread.objects.all()
    serializer_class = ChatThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatThread.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages__sender').order_by('-updated_at')

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get total unread message count for the user"""
        count = Message.objects.filter(receiver=request.user, is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['post'])
    def start_chat(self, request):
        other_user_id = request.data.get('user_id')
        job_id = request.data.get('job_id')
        
        if not other_user_id:
            return Response({"error": "User ID required"}, status=400)
            
        try:
            from jobs.models import Job
            
            other_user = User.objects.get(id=other_user_id)
            job = None
            if job_id:
                job = Job.objects.get(id=job_id)
                
            thread = ChatThread.get_or_create_for_users(request.user, other_user, job=job)
            
            serializer = self.get_serializer(thread)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
             return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark all messages in this thread as read for the current user"""
        thread = self.get_object()
        Message.objects.filter(
            thread=thread,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'status': 'all messages marked as read'})

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        thread_id = self.request.query_params.get('thread_id')
        if thread_id:
            return Message.objects.filter(
                thread_id=thread_id,
                thread__participants=self.request.user
            ).select_related('sender', 'receiver').order_by('created_at')
        return Message.objects.filter(
            thread__participants=self.request.user
        ).select_related('sender', 'receiver').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        if message.receiver == request.user:
            message.mark_read()
            return Response({'status': 'marked as read'})
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
