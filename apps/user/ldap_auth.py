import json
from django_auth_ldap.backend import LDAPBackend
from decouple import config

# Load and parse the JSON from .env
AD_CONFIGS_LIST = json.loads(config("AD_CONFIGS_JSON"))
AD_CONFIGS = {item["key"]: item for item in AD_CONFIGS_LIST}


class MultiADLDAPBackend(LDAPBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        ad_choice = request.POST.get("ad_choice") if request else None
        ad_config = AD_CONFIGS.get(ad_choice)
        if ad_config:
            backend = LDAPBackend()
            backend.settings.SERVER_URI = ad_config["SERVER_URI"]
            backend.settings.BIND_DN = ad_config["BIND_DN"]
            backend.settings.BIND_PASSWORD = ad_config["BIND_PASSWORD"]
            backend.settings.USER_DN_TEMPLATE = ad_config["USER_DN_TEMPLATE"]
            if username:
                username = username.lower()
            return backend.authenticate(request, username, password, **kwargs)
        return None
