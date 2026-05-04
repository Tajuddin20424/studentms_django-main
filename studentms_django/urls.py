from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from students import views as student_views

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('',                student_views.home,  name='home'),
    # ── Original routes ──────────────────────────────────────
    path('students/',       include('students.urls')),
    path('teachers/',       include('teachers.urls')),
    path('subjects/',       include('subjects.urls')),
    path('classes/',        include('classes.urls')),
    path('designation/',   include('designation.urls')),
    path('department/',   include('department.urls')),
    path('staff/', include('staff.urls'))

]

if settings.DEBUG:
    # Serve static files
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.STATICFILES_DIRS[0])