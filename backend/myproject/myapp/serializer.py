from rest_framework.serializers import ModelSerializer
from .models import QuestionModel


class QuestionSerializer(ModelSerializer):
    class Meta:
        model = QuestionModel
        fields = ["question_id", "answer"]