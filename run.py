"""
Script lanzador directo para el servidor backend de Sentix-Hotel.
Permite iniciar la API en desarrollo con recarga en vivo de forma simplificada.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)

