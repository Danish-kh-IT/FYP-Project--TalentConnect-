from rest_framework import serializers
from .models import Interview

class InterviewSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='application.applicant.get_full_name', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    
    class Meta:
        model = Interview
        fields = '__all__'
        read_only_fields = ['interviewer', 'created_at', 'updated_at']
