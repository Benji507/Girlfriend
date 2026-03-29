# Proyecto romantico personalizable

## Archivos importantes

- `index.html`: estructura de la pagina
- `styles.css`: estilos con curvas y formato responsive
- `script.js`: movimiento del boton `No`, musica y modal
- `config.js`: aqui personalizas textos, fondo, icono y musica
- `run_web.py`: abre la pagina usando Python

## Como personalizar

En `config.js` puedes cambiar:

- `backgroundImage` para el fondo
- `iconImage` para el icono de arriba
- `musicFile` para la musica
- `question`, `supportText`, `yesText`, `noText`
- `successTitle` y `successMessage`
- `cardRoundness` para mas o menos curvas

## Ajuste automatico de imagen

El fondo y el icono se ajustan automaticamente con `object-fit: cover`, asi que llenan el espacio sin deformarse.

## Como abrirlo

```powershell
python run_web.py
```

## Para celular

Puedes publicar el repo con GitHub Pages para abrirlo desde el celular con un link.
