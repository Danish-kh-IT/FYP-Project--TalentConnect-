from django.urls import path

from . import views

app_name = "chat"

urlpatterns = [
    path("", views.inbox, name="inbox"),
    path("start/<int:user_id>/", views.start_chat, name="start"),
    path("thread/<int:thread_id>/", views.conversation, name="conversation"),
]
