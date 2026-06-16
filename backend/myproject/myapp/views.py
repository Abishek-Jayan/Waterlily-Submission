from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import QuestionModel
from .serializer import QuestionSerializer


def _user_payload(user):
    return {"id": user.id, "username": user.username}


@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"ok": True})


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"detail": "username and password required"}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({"detail": "username already taken"}, status=400)
        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return Response(_user_payload(user), status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = authenticate(
            username=request.data.get("username"),
            password=request.data.get("password"),
        )
        if user is None:
            return Response({"detail": "invalid credentials"}, status=401)
        login(request, user)
        return Response(_user_payload(user))


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"ok": True})


class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"user": None})
        return Response({"user": _user_payload(request.user)})


class QuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuestionSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        for item in serializer.validated_data:
            QuestionModel.objects.update_or_create(
                user=request.user,
                question_id=item["question_id"],
                defaults={"answer": item["answer"]},
            )
        return Response(status=201)

    def get(self, request):
        answers = QuestionModel.objects.filter(user=request.user)
        return Response(QuestionSerializer(answers, many=True).data)
