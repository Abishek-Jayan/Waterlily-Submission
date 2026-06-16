from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    MeView,
    QuestionView,
    RegisterView,
    csrf,
)

urlpatterns = [
    path('csrf/', csrf),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', MeView.as_view()),
    path('formsubmit/', QuestionView.as_view()),
]
