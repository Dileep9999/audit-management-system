from decouple import config, Csv
import os
from pathlib import Path
from django.utils.translation import gettext as _
import ldap
from django_auth_ldap.config import LDAPSearch, GroupOfUniqueNamesType
from celery.schedules import crontab

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment-based settings
SECRET_KEY = config("DJANGO_SECRET_KEY")
DEBUG = config("DJANGO_DEBUG", cast=bool)
ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", cast=Csv())

BASE_DIR = Path(__file__).resolve().parent.parent

# CORS
CORS_ORIGIN_ALLOW_ALL = config("CORS_ORIGIN_ALLOW_ALL", cast=bool)
CORS_ALLOW_CREDENTIALS = config("CORS_ALLOW_CREDENTIALS", cast=bool)

# CSRF Trusted Origins
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", cast=Csv())

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

LANGUAGES = [
    ("ar", "Arabic"),
    ("en", "English"),
]

AUTH_USER_MODEL = "user.User"

# Application definition
INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_filters",
    "django_celery_results",
    "audit",
    "rest_framework",
    "rest_framework.authtoken",
    "rosetta",
    "import_export",
    "impersonate",
    "apps.user",
    "apps.utils",
    "apps.translation",
    "apps.notifications",
    "apps.files",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "apps.user.middlewares.UserLanguageMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "impersonate.middleware.ImpersonateMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "audit.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "audit.wsgi.application"

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


AUTH_LDAP_SERVER_URI = config("AUTH_LDAP_SERVER_URI")
AUTH_LDAP_BIND_DN = config("AUTH_LDAP_BIND_DN")
AUTH_LDAP_BIND_PASSWORD = config("AUTH_LDAP_BIND_PASSWORD")
AUTH_LDAP_USER_DN_TEMPLATE = config("AUTH_LDAP_USER_DN_TEMPLATE")
AUTH_LDAP_GROUP_SEARCH = LDAPSearch(
    config("AUTH_LDAP_GROUP_SEARCH_BASE"),
    ldap.SCOPE_SUBTREE,
)
AUTH_LDAP_GROUP_TYPE = GroupOfUniqueNamesType()
AUTH_LDAP_REQUIRE_GROUP = config("AUTH_LDAP_REQUIRE_GROUP")
AUTH_LDAP_MIRROR_GROUPS = False

# Map LDAP attributes to Django user fields
AUTH_LDAP_USER_ATTR_MAP = {
    "username": "uid",
    "first_name": "first_name",
    "last_name": "last_name",
    "email": "mail",
    "title": "title",
    "department": "department",
}
AUTH_LDAP_USER_SEARCH = LDAPSearch(
    "dc=wistle,dc=net",  # LDAP search base
    ldap.SCOPE_SUBTREE,  # Scope
    "(sAMAccountName=%(user)s)",  # LDAP search filter
)

AUTH_LDAP_USER_FLAGS_BY_GROUP = {
    "is_active": "cn=active,ou=groups,dc=wistle,dc=net",
    "is_staff": "cn=staff,ou=groups,dc=wistle,dc=net",
    "is_superuser": "cn=superuser,ou=groups,dc=wistle,dc=net",
}

AUTH_LDAP_USER_CREATE = True  # Create Django users for new LDAP users
AUTH_LDAP_ALWAYS_UPDATE_USER = True  # Update user data on each login


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django_auth_ldap": {
            "level": "DEBUG",
            "handlers": ["console"],
        },
    },
}

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTHENTICATION_BACKENDS = [
    "apps.user.ldap_auth.MultiADLDAPBackend",  # LDAP first
    "django.contrib.auth.backends.ModelBackend",
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/
LANGUAGE_COOKIE_NAME = "language"
LOCALE_PATHS = [BASE_DIR / "locale"]  #
LANGUAGE_CODE = "en"
TIME_ZONE = "Asia/Dubai"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT", cast=int)
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = config("EMAIL_USE_TLS", cast=bool, default=False)
EMAIL_USE_SSL = config("EMAIL_USE_SSL", cast=bool, default=False)


ROSETTA_ACCESS_CONTROL_FUNCTION = "apps.utils.permissions.is_translator"
ROSETTA_ENABLE_TRANSLATION_SUGGESTIONS = True
ROSETTA_MESSAGES_PER_PAGE = 50

DEBUG = config("DEBUG", cast=bool, default=True)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # "apps.utils.csrf.CsrfExemptSessionAuthentication",
        # 'rest_framework.authentication.BasicAuthentication',
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        # 'rest_framework.permissions.IsAuthenticatedOrReadOnly'
        "rest_framework.permissions.IsAuthenticated"
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "apps.utils.pagination.CustomPagination",
    "PAGE_SIZE": 50,
    "SEARCH_PAGE_SIZE": 10,
}

ADMIN_SITE_URL = config("ADMIN_SITE_URL", default="admin/")


CELERY_BROKER_URL = config("CELERY_BROKER_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND", default="django-db")

CELERY_BEAT_SCHEDULE = {
    "clear-expired-sessions-every-minute": {
        "task": "my_custom_clear_sessions_task",
        "schedule": crontab(hour=0, minute=0),  # Run daily at midnight
    },
}


"""
Sets the default session expiry to 1800 seconds (30 minutes).
If the session is not modified or accessed, it will expire 30 minutes after it was created (unless overridden by set_expiry()).
SESSION_COOKIE_AGE = 60 * 30  # 30 minutes
"""
# SESSION_COOKIE_AGE = 60 * 30 # 30 minutes


"""
Resets the session expiry timer on every request that uses the session.
So, if the user is active (making requests), their session will not expire as long as they keep interacting with the site.
The session will only expire if there is 30 minutes of inactivity.
 """
# SESSION_SAVE_EVERY_REQUEST = True  # Reset expiry time on every request
