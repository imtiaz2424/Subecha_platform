from rest_framework import serializers
from .models import Project, Category, Review
from accounts.serializers import UserProfileSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.full_name', read_only=True)
    freelancer_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Review
        fields = ['id', 'project', 'client', 'client_name', 'freelancer', 'freelancer_name', 'freelancer_email', 'rating', 'comment', 'created_at']
        read_only_fields = ['client', 'freelancer', 'created_at']

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        freelancer_email = validated_data.pop('freelancer_email', None)
        try:
            freelancer = User.objects.get(email=freelancer_email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'error': 'Freelancer not found with this email.'})
        validated_data['freelancer'] = freelancer
        return super().create(validated_data)


class ProjectSerializer(serializers.ModelSerializer):
    client_info = UserProfileSerializer(source='client', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    proposal_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'client', 'client_info', 'title', 'description',
            'category', 'category_name', 'budget', 'deadline',
            'status', 'attachment', 'reviews', 'proposal_count', 'created_at'
        ]
        read_only_fields = ['client', 'created_at']

    def get_proposal_count(self, obj):
        return obj.proposals.count()


class ProjectListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    proposal_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'category_name', 'client_name', 'budget', 'deadline', 'status', 'proposal_count', 'created_at']

    def get_proposal_count(self, obj):
        return obj.proposals.count()