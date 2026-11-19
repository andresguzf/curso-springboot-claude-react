---
name: sdd-next-task
description: Ejecuta el desarrollo guiado por especificaciones (SDD) del proyecto tarea por tarea - lee el índice specs/README.md, la constitución, la spec, el plan y el tasks.md de la fase en curso (frontend 4-react o backend 3-spring-api), toma la siguiente tarea pendiente cuyas dependencias estén hechas (o la que se pida por ID, como D-03), la implementa, la verifica, marca su checkbox, hace commit en el repo que corresponde y se detiene para revisión. Úsala siempre que el usuario diga "siguiente tarea", "continúa con el SDD", "sigue con la spec", "ejecuta la tarea A-04", "qué tarea sigue", "avanza con la fase", o pregunte por el estado de las specs, aunque no nombre esta skill.
---

# SDD: siguiente tarea

Esta skill avanza el SDD **una tarea por vez**. Ejecutar de a una permite que el
usuario revise cada cambio (es un curso: cada commit se explica en pantalla) y evita
que un error temprano se arrastre por varias tareas. Por eso, aunque la tarea sea
pequeña o la siguiente parezca obvia, se termina una, se informa y se espera.

## Mapa del SDD

```
4-react/specs/README.md                     índice global: fases 01–06, repo, estado
4-react/specs/constitution.md               reglas del frontend
4-react/specs/NN-fase/{spec,plan,tasks}.md  fases 02–06 (frontend)
../3-spring-api/specs/constitution.md        reglas del backend
../3-spring-api/specs/01-…/{spec,plan,tasks}.md   fase 01 (backend)
```

Rutas relativas a la raíz de `4-react`. Si la sesión corre en otro directorio, usa las
rutas absolutas de ambos repos (son carpetas hermanas).

## 1. Elegir la tarea

1. Lee `specs/README.md` para ver el orden de las fases, su repo y su estado.
2. Si el usuario pidió un ID (`D-03`), busca esa tarea. Si no, recorre las fases en
   orden y toma la **primera tarea `[ ]` cuyas dependencias estén todas en `[x]`**.
   Las dependencias pueden ser de otra fase u otro repo (p. ej. `D-01` depende de `A-06`).
3. Si la tarea pedida tiene dependencias pendientes, no la ejecutes: di cuáles faltan
   y ofrece ejecutar la primera de ellas.
4. Si el usuario solo pregunta por el estado ("¿qué tarea sigue?"), responde con la
   tarea elegida, su fase y sus dependencias, sin implementar nada.

## 2. Cargar el contexto

Antes de tocar código lee, en este orden:

1. La `constitution.md` del repo de la tarea: son las reglas que no se negocian.
2. El `spec.md` de la fase: los criterios de aceptación (CA) y requisitos (RF) que la tarea cubre (campo "Cubre").
3. El `plan.md` de la fase: contrato, decisiones y archivos.
4. La tarea completa en `tasks.md`.
5. Las skills del repo, según lo que toque la tarea:
   - frontend: `react-rules` (siempre que haya código React) y `frontend-design` (cuando la tarea define o cambia aspecto visual);
   - backend: `spring-boot-best-practices`.
6. Para integración con la API: `../3-spring-api/README.md` y `../3-spring-api/CLAUDE.md`.

Revisa también el estado de git del repo de la tarea (rama y cambios sin commit). Si
hay cambios ajenos sin commit, detente y pregunta antes de seguir: no los mezcles con
la tarea.

## 3. Implementar

- Trabaja en la rama de la fase que indica la constitución (`feature/paginacion-filtros`
  en el backend, `feature/dashboard` en el frontend). La primera tarea de cada repo la crea.
- Haz exactamente lo que pide la tarea, con los archivos que lista. Si para cumplir
  el "Hecho cuando" necesitas tocar otro archivo, hazlo y menciónalo.
- No adelantes trabajo de tareas futuras, aunque sea tentador: rompe la revisión paso a paso.
- Tareas que piden aprobación (p. ej. B-04, el plan visual): prepara la propuesta,
  muéstrala y **detente** hasta que el usuario apruebe; recién entonces implementa.

## 4. Verificar

Ejecuta la verificación que indica la tarea y la definición de "hecho" de la constitución:

- backend: `./mvnw test` (y los curl indicados, con la app levantada en segundo plano si hace falta);
- frontend: `npm run build` y `npm run lint`, más la prueba en navegador si la tarea la pide (usa el navegador integrado; el backend debe estar arriba).

Si algo falla, corrígelo. Si no puedes resolverlo, **no marques la tarea**: informa
qué falló, con la salida relevante, y detente.

## 5. Desvíos respecto de la spec

Si la implementación necesita algo distinto de lo especificado (otra firma, otro
archivo, una decisión que no funciona), actualiza `spec.md` o `plan.md` **en el mismo
commit** y dilo explícitamente en el resumen. La spec debe describir siempre lo que
realmente se construyó; nunca te desvíes en silencio.

## 6. Cerrar la tarea

1. Marca la tarea `[x]` en su `tasks.md`.
2. Actualiza el estado de la fase en `4-react/specs/README.md` (`En curso (X/N)` o `Hecha`)
   y, al completar la fase, el estado en la cabecera de su `spec.md`.
3. Haz commit en el repo de la tarea con el mensaje que indica la tarea (en español,
   imperativo) y el trailer `Co-Authored-By` de la sesión. Si la tarea es del backend,
   el cambio del índice de `4-react` va en un commit aparte en `4-react`
   ("Actualiza el estado del SDD: A-04").
4. **No hagas push ni merge.** Al cerrar la última tarea de una fase, pregunta si se
   hace merge de la rama a `main` y push.

## 7. Informar y detenerte

Termina con un resumen corto en español:

- tarea ejecutada (ID y título) y requisitos cubiertos;
- archivos creados o modificados;
- cómo se verificó y el resultado;
- desvíos de la spec, si hubo;
- la siguiente tarea disponible (ID, título y si espera algo del usuario).

Después espera la revisión del usuario. No continúes con la siguiente tarea por tu
cuenta.

## Reglas transversales

- Privacidad: nunca escribas correos, contraseñas, tokens ni datos personales reales
  en código, specs o commits; las credenciales locales viven en `.env` / `.env.local`.
- No cambies la constitución sin pedirlo: si una regla bloquea la tarea, explícalo y
  propone el cambio.
