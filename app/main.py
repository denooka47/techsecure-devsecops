"""
TechSecure Solutions - Aplicacao web simples (POC DevSecOps).

Endpoints:
  GET /              pagina HTML institucional
  GET /health        healthcheck usado pelo container e pelo deploy
  GET /api/version   versao da aplicacao e das libs
  GET /api/soma      exemplo com logica testavel (ex.: /api/soma?a=2&b=3)
"""
import os

import requests  # lib de exemplo: alvo do scan de dependencias (Trivy/pip-audit)
from flask import Flask, jsonify, render_template, request

APP_VERSION = os.environ.get("APP_VERSION", "1.0.0")


def somar(a: float, b: float) -> float:
    """Soma dois numeros. Funcao pura usada nos testes automatizados."""
    return a + b


def create_app() -> Flask:
    app = Flask(__name__)

    @app.route("/")
    def index():
        return render_template("index.html", version=APP_VERSION)

    @app.route("/health")
    def health():
        return jsonify(status="ok", version=APP_VERSION), 200

    @app.route("/api/version")
    def version():
        return jsonify(
            app="TechSecure Solutions",
            version=APP_VERSION,
            requests_lib=requests.__version__,
        ), 200

    @app.route("/api/soma")
    def soma():
        try:
            a = float(request.args.get("a", "0"))
            b = float(request.args.get("b", "0"))
        except ValueError:
            return jsonify(erro="parametros a e b devem ser numericos"), 400
        return jsonify(a=a, b=b, resultado=somar(a, b)), 200

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
