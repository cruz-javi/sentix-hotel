# Arranque integral de Sentix-Hotel en Windows.
# Valida el entorno virtual de Python, las dependencias, el modelo de spaCy, compila
# el frontend y levanta la API que sirve la interfaz en http://127.0.0.1:8000

param(
    [switch]$SkipFrontendBuild,
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$venvPython = if (Test-Path (Join-Path $projectRoot '.venv\Scripts\python.exe')) {
    Join-Path $projectRoot '.venv\Scripts\python.exe'
}
else {
    Join-Path $projectRoot 'venv\Scripts\python.exe'
}

# 1. Entorno virtual de Python (se crea con el lanzador py si esta disponible)
if (-not (Test-Path $venvPython)) {
    Write-Host '[1/5] Creando entorno virtual en venv/...'
    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -3 -m venv venv
    }
    else {
        python -m venv venv
    }
}
else {
    Write-Host '[1/5] Entorno virtual existente detectado.'
}

# 2. Dependencias de Python: solo se instalan si falta el nucleo de ciencia de datos
& $venvPython -c "import sklearn, pandas, fastapi, spacy, nltk" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host '[2/5] Instalando dependencias de requirements.txt...'
    & $venvPython -m pip install --upgrade pip --disable-pip-version-check
    & $venvPython -m pip install -r (Join-Path $projectRoot 'requirements.txt') --disable-pip-version-check
}
else {
    Write-Host '[2/5] Dependencias de Python ya instaladas.'
}

# 3. Modelo de lematizacion en espanol requerido por src/nlp/morphology.py
& $venvPython -c "import spacy; spacy.load('es_core_news_sm')" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host '[3/5] Descargando modelo de spaCy es_core_news_sm...'
    & $venvPython -m spacy download es_core_news_sm
}
else {
    Write-Host '[3/5] Modelo de spaCy disponible.'
}

# 4. Frontend compilado: la API lo sirve como archivos estaticos desde frontend/dist
$distIndex = Join-Path $projectRoot 'frontend\dist\index.html'
if ($SkipFrontendBuild -and (Test-Path $distIndex)) {
    Write-Host '[4/5] Compilacion del frontend omitida (-SkipFrontendBuild).'
}
elseif (Test-Path $distIndex) {
    Write-Host '[4/5] Frontend ya compilado en frontend/dist.'
}
else {
    Write-Host '[4/5] Compilando frontend con Vite...'
    $nodeDir = 'C:\Program Files\nodejs'
    if ((Test-Path $nodeDir) -and ($env:PATH -notlike "*$nodeDir*")) {
        $env:PATH = "$nodeDir;$env:PATH"
    }

    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        throw 'Node.js no esta instalado. Instalalo con: winget install OpenJS.NodeJS.LTS'
    }

    Push-Location (Join-Path $projectRoot 'frontend')
    try {
        if (-not (Test-Path 'node_modules')) {
            npm install --no-audit --no-fund
        }
        npm run build
    }
    finally {
        Pop-Location
    }
}

# 5. Servidor: FastAPI expone /api/* y la interfaz compilada en la raiz
Write-Host "[5/5] Iniciando API en http://127.0.0.1:$Port (Ctrl+C para detener)..."
& $venvPython -m uvicorn api.main:app --host 127.0.0.1 --port $Port --reload
