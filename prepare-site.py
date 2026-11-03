from pathlib import Path
import zipfile,subprocess,sys
root=Path(__file__).parent
archive=root/'dist/question-data.zip'
if archive.exists():
    with zipfile.ZipFile(archive) as z:
        for name in z.namelist():
            assert Path(name).name==name and name.endswith('.json'), 'Unsafe question path'
        z.extractall(root/'dist/questions')
subprocess.run([sys.executable,str(root/'validate.py')],check=True)
subprocess.run([sys.executable,str(root/'build-local.py')],check=True)
