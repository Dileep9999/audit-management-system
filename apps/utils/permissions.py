def is_translator(user):
    return user.is_active and (
        user.is_staff or user.has_perm("rosetta.change_translation")
    )
