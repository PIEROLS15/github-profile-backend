# Backend

API NestJS para obtener un perfil de GitHub.

## Endpoint

- `GET /`
- `GET /user/:username`

## Estructura

```text
src/
  profile/
    github.client.ts
    github.parsers.ts
    profile.controller.ts
    profile.service.ts
    profile.service.spec.ts
    profile.module.ts
    profile.types.ts
  app.module.ts
  main.ts
```

### Responsabilidad de cada archivo

- `github.client.ts`: llamadas HTTP puras a GitHub.
- `github.parsers.ts`: transformación del HTML crudo a datos internos.
- `profile.service.ts`: orquestación, caché y manejo de errores HTTP.
- `profile.controller.ts`: expone la ruta del perfil y delega en el service.
- `profile.types.ts`: contratos internos del backend.
- `profile.module.ts`: registra controller y providers.
- `main.ts`: bootstrap local y handler serverless para Vercel.

## Por qué esta estructura

- Agrupa todo por feature (`profile`) y no por tipo de archivo disperso.
- Mantiene `controller`, `service`, `client` y `parsers` con una sola responsabilidad.
- Es suficiente para un backend pequeño, sin sobreingeniería tipo hexagonal/DDD.
- Facilita escalar el proyecto si luego se agregan más recursos como `repos` u `orgs`.

## Cómo funciona

1. `GET /` responde un mensaje mínimo de estado.
2. El controller recibe `GET /user/:username`.
3. El service valida, aplica caché e inicia la orquestación.
4. El cliente hace fetch a GitHub.
5. Los parsers convierten HTML y respuestas crudas en el contrato interno.
6. El service arma el payload final y devuelve la respuesta al frontend.

## Ejecutar localmente

```bash
npm install
npm run start:dev
```

## Variables de entorno

- `PORT`: opcional, por defecto `3000`.

## Notas de implementación

- Las contribuciones se obtienen desde la página pública de GitHub por scraping HTML.
- El README público del perfil se obtiene desde la API pública de GitHub.
- En Vercel, `src/main.ts` actúa como entrypoint serverless directo con `@vercel/node`.

## Deploy

- Diseñado para correr en Vercel como API serverless con NestJS.
- En producción la URL pública responde en `/` y `/user/:username`.
- Exponer la URL pública y usarla desde el frontend mediante `NEXT_PUBLIC_API_BASE_URL`.
