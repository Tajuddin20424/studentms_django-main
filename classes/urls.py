from django.urls import path
from . import views

urlpatterns = [
    path('', views.class_list, name='class-list'),
    path('get-classes/', views.get_classes, name='get-classes'),
    path('add/', views.class_add, name='class-add'),
    # path('get-teachers/', views.get_teachers, name='get-teachers'),
    path('get-subjects-combo/', views.get_subjects_combo, name='get-subjects-combo'),
    path('save-classes/', views.save_classes, name='save-classes'),
    # path('update-subjects/', views.update_subjects, name='update-subjects'),
    # path('remove-subjects/', views.remove_subjects, name='remove-subjects'),
    # path('subject-edit/<int:id>/', views.subject_edit, name='subject-edit'),
    # # path('update/<int:id>/', views.update_subnect, name='subject-update'),
    # # path('delete/<int:id>/', views.delete_subject, name='subject-delete'),

]
