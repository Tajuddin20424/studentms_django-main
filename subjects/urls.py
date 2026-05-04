from django.urls import path
from . import views

urlpatterns = [
    path('', views.subject_list, name='subject-list'),
    path('add/', views.subject_add, name='subject-add'),
    path('get-teachers/', views.get_teachers, name='get-teachers'),
    path('get-subjects/', views.get_subjects, name='get-subjects'),
    path('save-subjects/', views.save_subjects, name='save-subjects'),
    path('update-subjects/', views.update_subjects, name='update-subjects'),
    path('remove-subjects/', views.remove_subjects, name='remove-subjects'),
    path('subject-edit/<int:id>/', views.subject_edit, name='subject-edit'),
    # path('update/<int:id>/', views.update_subnect, name='subject-update'),
    # path('delete/<int:id>/', views.delete_subject, name='subject-delete'),

]
