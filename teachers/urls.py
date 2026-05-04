from django.urls import path
from . import views

urlpatterns = [
    path('', views.teacher_list, name='teacher-list'),
    path('add/', views.add_teacher, name='teacher-add'),
    path('update/<int:id>/', views.update_teacher, name='teacher-update'),
    path('delete/<int:id>/', views.delete_teacher, name='teacher-delete'),

]
