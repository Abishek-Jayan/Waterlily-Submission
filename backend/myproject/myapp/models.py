from django.conf import settings
from django.db import models


class QuestionModel(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question_id = models.IntegerField()
    answer = models.CharField(max_length=255)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "question_id"],
                name="unique_user_question",
            ),
        ]


