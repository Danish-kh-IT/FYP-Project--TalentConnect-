import os
import glob

apps = ['users', 'companies', 'jobs', 'applications', 'chat']
base_dir = os.getcwd()

for app in apps:
    migration_dir = os.path.join(base_dir, app, 'migrations')
    if os.path.exists(migration_dir):
        files = glob.glob(os.path.join(migration_dir, '[0-9]*.py'))
        for f in files:
            try:
                os.remove(f)
                print(f"Removed {f}")
            except Exception as e:
                print(f"Error removing {f}: {e}")
    else:
        print(f"Migration dir not found for {app}")
