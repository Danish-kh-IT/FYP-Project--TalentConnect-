from django.db import models
from django.contrib.auth.models import User
from applications.models import Application

class Interview(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TYPE_CHOICES = [
        ('online', 'Online'),
        ('in_person', 'In-Person'),
    ]

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    interviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conducted_interviews')
    
    interview_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    interview_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='online')
    location_or_link = models.TextField()  # URL for online, address for in-person
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    interviewer_feedback = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['interview_date']

    def __str__(self):
        return f"Interview for {self.application.job.title} with {self.application.applicant.get_full_name()}"
