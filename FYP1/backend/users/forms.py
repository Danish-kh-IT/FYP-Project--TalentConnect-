from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile, UserEducation, UserExperience


class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    user_type = forms.ChoiceField(
        choices=[('candidate', 'Job Seeker'), ('employer', 'Employer')],
        widget=forms.RadioSelect,
        initial='candidate'
    )
    
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'user_type', 'password1', 'password2')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        if commit:
            user.save()
            # Create user profile
            UserProfile.objects.create(
                user=user,
                user_type=self.cleaned_data['user_type']
            )
        return user


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = [
            'user_type', 'phone', 'profile_picture', 'bio', 'skills',
            'experience_years', 'education', 'portfolio_url', 'linkedin_url',
            'github_url', 'location'
        ]
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4}),
            'skills': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Enter skills separated by commas'}),
            'education': forms.Textarea(attrs={'rows': 3}),
        }


class UserEducationForm(forms.ModelForm):
    class Meta:
        model = UserEducation
        fields = [
            'institution', 'degree', 'field_of_study', 'start_date',
            'end_date', 'is_current', 'description'
        ]
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }


class UserExperienceForm(forms.ModelForm):
    class Meta:
        model = UserExperience
        fields = [
            'company', 'position', 'start_date', 'end_date',
            'is_current', 'description', 'location'
        ]
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 4}),
        }