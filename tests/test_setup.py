import importlib.util
from pathlib import Path


def load_setup_module():
    setup_path = Path(__file__).resolve().parents[1] / "setup.py"
    spec = importlib.util.spec_from_file_location("project_setup", setup_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_ensure_env_file_copies_example(tmp_path):
    module = load_setup_module()
    (tmp_path / ".env.example").write_text("PLAID_ENV=production\n", encoding="utf-8")

    created = module.ensure_env_file(tmp_path)

    assert created is True
    assert (tmp_path / ".env").read_text(encoding="utf-8") == "PLAID_ENV=production\n"


def test_ensure_env_file_is_idempotent(tmp_path):
    module = load_setup_module()
    (tmp_path / ".env.example").write_text("PLAID_ENV=production\n", encoding="utf-8")
    (tmp_path / ".env").write_text("EXISTING=1\n", encoding="utf-8")

    created = module.ensure_env_file(tmp_path)

    assert created is False
    assert (tmp_path / ".env").read_text(encoding="utf-8") == "EXISTING=1\n"
