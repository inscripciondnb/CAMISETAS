SISTEMA DE PEDIDOS DE CAMISETAS · COPA INTEGRACIÓN 2026

ARCHIVOS
- index.html: formulario público.
- admin.html: panel para consultar pedidos.
- Code.gs: backend para Google Apps Script + Google Sheets + Google Drive.

CONFIGURACIÓN
1. Crear una Google Sheet nueva.
2. Abrir Extensiones > Apps Script.
3. Pegar Code.gs.
4. Crear una carpeta en Google Drive para comprobantes y copiar el ID de la carpeta.
5. En Code.gs, reemplazar PEGAR_AQUI_ID_CARPETA_DRIVE.
6. Cambiar ADMIN_KEY por una clave segura.
7. En Apps Script: Implementar > Nueva implementación > Aplicación web.
   - Ejecutar como: vos.
   - Quién tiene acceso: Cualquiera.
8. Copiar la URL terminada en /exec.
9. En index.html y admin.html reemplazar PEGAR_AQUI_URL_APPS_SCRIPT por esa URL.
10. Publicar index.html y admin.html en Cloudflare Pages, GitHub Pages o tu hosting.

FUNCIONAMIENTO
- El comprador completa nombre y apellido.
- Elige cantidades independientes por talle (XS a XXXL).
- Adjunta PDF/imagen o toma foto desde el celular.
- El comprobante se guarda en Drive.
- El pedido se guarda en la hoja Pedidos.
- admin.html permite ver todos los pedidos y abrir el comprobante.

NOTA DE SEGURIDAD
La clave del panel viaja en la URL de consulta. Para un sistema más sensible conviene reemplazarlo por autenticación real (por ejemplo Supabase/Auth). Para un panel interno simple, esta versión es funcional.
