# Operacion del historico de ventas

Guia corta para operar el sistema en produccion.

## Subir archivo a Drive

1. Abre la carpeta de Google Drive configurada para ventas.
2. Sube el archivo mensual `.xls` o `.xlsx`.
3. Verifica que el archivo tenga las columnas de matriz: `Mes`, `Ano`, `Establecimiento` y `Total`.
4. Entra al sistema como admin.
5. Ve a `Ventas` y pulsa `Sincronizar Drive`.
6. Revisa el mensaje de resultado y el panel `Ultimas sincronizaciones`.

## Corregir un mes

1. Sube a Drive el archivo corregido del mismo periodo.
2. Entra como admin.
3. Pulsa `Sincronizar Drive`.
4. La matriz mensual se trata como foto oficial del periodo: reemplaza las ventas de matriz anteriores del mismo mes y evita acumulados.
5. Confirma que el total calculado coincida con el archivo.

## Si Google se desconecta

1. Entra como admin.
2. Ve a `Estado` y revisa `Google Drive`.
3. Si aparece como desconectado, vuelve a `Ventas`.
4. Pulsa `Conectar Google`.
5. Autoriza con la cuenta que tiene acceso a la carpeta de Drive.
6. Regresa al sistema y pulsa `Sincronizar Drive`.

## Antes de cerrar el mes

1. Confirma que el ultimo archivo leido corresponda al periodo correcto.
2. Revisa `Total calculado` en `Estado`.
3. Compara el total con el reporte oficial.
4. Revisa cumplimiento por almacen.
5. Exporta o guarda un respaldo de la base antes de hacer correcciones grandes.

## Revision rapida de estado

En `Estado` se puede revisar:

- Conexion Google.
- Estado de base de datos.
- Ultima sincronizacion.
- Archivo leido.
- Periodo.
- Total calculado.
