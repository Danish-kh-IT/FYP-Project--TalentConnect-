from django.shortcuts import redirect
from functools import wraps

def candidate_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            try:
                if request.user.profile.user_type == 'candidate':
                    return view_func(request, *args, **kwargs)
                else:
                    return redirect('jobs:home') 
            except:
                return redirect('users:login')
        else:
            return redirect('users:login')
    return wrapper
