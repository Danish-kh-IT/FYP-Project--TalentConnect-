from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from users.serializers import UserSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    applicant = UserSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['applicant', 'applied_at', 'updated_at']

    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        # Use applicant from validated_data (set by perform_create) or request
        applicant = validated_data.pop('applicant', None)
        if not applicant:
            request = self.context.get('request')
            applicant = request.user
        
        # Check if already applied
        if Application.objects.filter(job_id=job_id, applicant=applicant).exists():
            raise serializers.ValidationError("You have already applied for this job.")
            
        application = Application.objects.create(job_id=job_id, applicant=applicant, **validated_data)
        return application
