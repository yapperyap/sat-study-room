"""Compatibility entrypoint: prepare the committed static website locally."""
import runpy
from pathlib import Path
if __name__ == '__main__':
    runpy.run_path(str(Path(__file__).with_name('prepare-site.py')),run_name='__main__')
