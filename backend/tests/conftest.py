import sys
import os
import pytest
from fastapi.testclient import TestClient

# 確保 tests 能夠導入 app 包
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
