from django import template

from users.models import UserProfile
from chat.models import ChatThread

register = template.Library()


@register.simple_tag
def user_type(user):
    try:
        return user.profile.user_type
    except (AttributeError, UserProfile.DoesNotExist):
        return None


@register.simple_tag
def user_profile(user):
    try:
        return user.profile
    except (AttributeError, UserProfile.DoesNotExist):
        return None


@register.simple_tag
def other_chat_participant(thread: ChatThread, user):
    try:
        return thread.other_participant(user)
    except Exception:
        return None

