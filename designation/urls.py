from django.urls import path
from . import views

urlpatterns = [
    path('list/',              views.designation_list,   name='designation_list'),
    path('add/',               views.designation_add,    name='add_designation'),  
    path('edit/<int:id>/',     views.edit_designation,   name='edit_designation'),
    path('delete/<int:id>/',   views.delete_designation, name='delete_designation'),
    path('toggle-status/<int:id>/',  views.toggle_designation_status, name='toggle_designation_status'),
]