from django.urls import path
from . import views

urlpatterns = [
    # Path for loading page and data.
    path('list/', views.staff_list_view, name='staff_list_view'),
    path('get-data/', views.get_staff_data, name='get_staff_data'),
    path('get-designation/', views.get_designation, name='get_designation'),
    
    # --- NEW: Path for fetching class list for checkboxes ---
    path('get-all-classes/', views.get_all_classes, name='get_all_classes'),

    # Path for adding new data and designations.
    path('add-data/', views.add_staff_data, name='add_staff_data'),
    path('add-designation/', views.add_designation_data, name='add_designation_data'),

    # --- Path for updating and deleting staff data ---
    path('get-single/', views.get_single_staff, name='get_single_staff'), 
    path('update-data/', views.update_staff_data, name='update_staff_data'), 
    path('delete-data/', views.delete_staff_data, name='delete_staff_data'), 
    path('get-all-classes/', views.get_all_classes, name='get_all_classes'),
    path('staff/add-class/', views.add_class_data, name='add_class_data'),
]