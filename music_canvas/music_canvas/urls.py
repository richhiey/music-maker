"""music_canvas URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from apps.interface import views as interface_views 
from apps.api import views as api_views
from django.conf.urls.static import static
from django.conf import settings

router = routers.DefaultRouter()
router.register(r'midi-track', api_views.MIDITrackView, 'midi-track')

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/', include(router.urls)),
	path('', interface_views.index ),
] +  static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)