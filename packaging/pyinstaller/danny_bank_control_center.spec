# PyInstaller spec for the Danny Bank local control center.
#
# Build with:
#   .venv/bin/python -m PyInstaller packaging/pyinstaller/danny_bank_control_center.spec --noconfirm

from pathlib import Path


ROOT = Path.cwd()


a = Analysis(
    [str(ROOT / 'packaging' / 'pyinstaller' / 'danny_bank_control_center_launcher.py')],
    pathex=[str(ROOT)],
    binaries=[],
    datas=[
        (str(ROOT / 'src' / 'appscript'), 'src/appscript'),
        (str(ROOT / 'sample_data'), 'sample_data'),
        (str(ROOT / '.env.example'), '.'),
    ],
    hiddenimports=[
        'dotenv',
        'google.oauth2.credentials',
        'google_auth_oauthlib.flow',
        'googleapiclient.discovery',
        'plaid',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='Danny Bank',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='Danny Bank',
)

app = BUNDLE(
    coll,
    name='Danny Bank.app',
    icon=None,
    bundle_identifier='com.dannybank.controlcenter',
    info_plist={
        'CFBundleDisplayName': 'Danny Bank',
        'CFBundleName': 'Danny Bank',
        'CFBundleShortVersionString': '0.6.4',
        'CFBundleVersion': '0.6.4',
        'NSHighResolutionCapable': True,
    },
)
