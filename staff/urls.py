from django.urls import path
from . import views

urlpatterns = [
    # Path for loading page and data.
    path('list/', views.staff_list_view, name='staff_list_view'),
    path('get-data/', views.get_staff_data, name='get_staff_data'),
    path('get-designation/', views.get_designation, name='get_designation'),
    
    # Path for adding new data and designations.
    path('add-data/', views.add_staff_data, name='add_staff_data'),
    path('add-designation/', views.add_designation_data, name='add_designation_data'),

    # --- Path for updating and deleting staff data ---
    path('get-single/', views.get_single_staff, name='get_single_staff'), # Fetch data for a specific staff member
    path('update-data/', views.update_staff_data, name='update_staff_data'), # Update staff data
    path('delete-data/', views.delete_staff_data, name='delete_staff_data'), # Delete staff data
]