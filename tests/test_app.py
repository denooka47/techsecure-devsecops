"""Testes automatizados da aplicacao TechSecure Solutions (pytest)."""
import pytest

from app.main import create_app, somar


@pytest.fixture()
def client():
    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as c:
        yield c


def test_somar_funcao_pura():
    assert somar(2, 3) == 5
    assert somar(-1, 1) == 0
    assert somar(2.5, 0.5) == 3.0


def test_health_ok(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_version_endpoint(client):
    resp = client.get("/api/version")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["app"] == "TechSecure Solutions"
    assert "version" in body


def test_api_soma_ok(client):
    resp = client.get("/api/soma?a=2&b=3")
    assert resp.status_code == 200
    assert resp.get_json()["resultado"] == 5.0


def test_api_soma_parametro_invalido(client):
    resp = client.get("/api/soma?a=abc&b=3")
    assert resp.status_code == 400
    assert "erro" in resp.get_json()


def test_index_responde_html(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"TechSecure Solutions" in resp.data
