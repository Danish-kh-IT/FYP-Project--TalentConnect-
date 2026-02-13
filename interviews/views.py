from rest_framework import viewsets, permissions
from .models import Interview
from .serializers import InterviewSerializer

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.user_type == 'employer':
            return self.queryset.filter(application__job__company__user=user)
        return self.queryset.filter(application__applicant=user)

    def perform_create(self, serializer):
        # Get the employer Profile, not User itself for checks if needed
        # But interviewer field in Model is User.
        serializer.save(interviewer=self.request.user)
