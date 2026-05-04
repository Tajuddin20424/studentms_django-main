from django.urls import path
from . import views

urlpatterns = [
    path('list/',    views.department_list,   name='department_list'),
    path('list2/',   views.department_list2,  name='department_list2'),
    path('get_list/',   views.get_department_list2,  name='get_department_list2'),

    path('add/',     views.department_add,    name='department_add'),
    path('edit/<int:id>/',   views.department_edit,   name='department_edit'),
    path('delete/<int:id>/', views.department_delete, name='department_delete'),
    path('update/<int:id>/', views.update_department, name='update_department'),
]