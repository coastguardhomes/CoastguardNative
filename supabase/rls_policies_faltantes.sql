-- =====================================================================
-- Políticas RLS para las tablas que tenían RLS activado y CERO políticas.
-- Con RLS activo y sin políticas, Postgres deniega todo: ni el admin podía
-- leer ni escribir. Eso dejaba sin funcionar el checklist, la firma de
-- inspección, las líneas de factura y los informes.
--
-- Se sigue exactamente el patrón ya usado en fotos_inspeccion/incidencias:
--   · lectura  -> es_admin() OR la inspección es visible (puede_ver_vivienda)
--   · escritura-> es_admin() OR el técnico asignado a esa vivienda
--   · borrado  -> es_admin()
-- Todas las políticas se aplican al rol `authenticated`.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- checklist_inspeccion
-- ---------------------------------------------------------------------
drop policy if exists checklist_select on public.checklist_inspeccion;
create policy checklist_select on public.checklist_inspeccion
  for select to authenticated
  using (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      where i.id = checklist_inspeccion.inspeccion_id
        and puede_ver_vivienda(i.vivienda_id)
    )
  );

drop policy if exists checklist_insert on public.checklist_inspeccion;
create policy checklist_insert on public.checklist_inspeccion
  for insert to authenticated
  with check (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      join public.viviendas v on v.id = i.vivienda_id
      where i.id = checklist_inspeccion.inspeccion_id
        and v.tecnico_id = mi_tecnico_id()
    )
  );

drop policy if exists checklist_update on public.checklist_inspeccion;
create policy checklist_update on public.checklist_inspeccion
  for update to authenticated
  using (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      join public.viviendas v on v.id = i.vivienda_id
      where i.id = checklist_inspeccion.inspeccion_id
        and v.tecnico_id = mi_tecnico_id()
    )
  )
  with check (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      join public.viviendas v on v.id = i.vivienda_id
      where i.id = checklist_inspeccion.inspeccion_id
        and v.tecnico_id = mi_tecnico_id()
    )
  );

drop policy if exists checklist_delete_admin on public.checklist_inspeccion;
create policy checklist_delete_admin on public.checklist_inspeccion
  for delete to authenticated
  using (es_admin());

-- ---------------------------------------------------------------------
-- firmas_inspeccion
-- ---------------------------------------------------------------------
drop policy if exists firmas_select on public.firmas_inspeccion;
create policy firmas_select on public.firmas_inspeccion
  for select to authenticated
  using (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      where i.id = firmas_inspeccion.inspeccion_id
        and puede_ver_vivienda(i.vivienda_id)
    )
  );

drop policy if exists firmas_insert on public.firmas_inspeccion;
create policy firmas_insert on public.firmas_inspeccion
  for insert to authenticated
  with check (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      join public.viviendas v on v.id = i.vivienda_id
      where i.id = firmas_inspeccion.inspeccion_id
        and v.tecnico_id = mi_tecnico_id()
    )
  );

drop policy if exists firmas_delete_admin on public.firmas_inspeccion;
create policy firmas_delete_admin on public.firmas_inspeccion
  for delete to authenticated
  using (es_admin());

-- ---------------------------------------------------------------------
-- fotos  (tabla hermana de fotos_inspeccion; mismas reglas)
-- ---------------------------------------------------------------------
drop policy if exists fotos_tabla_select on public.fotos;
create policy fotos_tabla_select on public.fotos
  for select to authenticated
  using (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      where i.id = fotos.inspeccion_id
        and puede_ver_vivienda(i.vivienda_id)
    )
  );

drop policy if exists fotos_tabla_insert on public.fotos;
create policy fotos_tabla_insert on public.fotos
  for insert to authenticated
  with check (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      join public.viviendas v on v.id = i.vivienda_id
      where i.id = fotos.inspeccion_id
        and v.tecnico_id = mi_tecnico_id()
    )
  );

drop policy if exists fotos_tabla_delete on public.fotos;
create policy fotos_tabla_delete on public.fotos
  for delete to authenticated
  using (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      join public.viviendas v on v.id = i.vivienda_id
      where i.id = fotos.inspeccion_id
        and v.tecnico_id = mi_tecnico_id()
    )
  );

-- ---------------------------------------------------------------------
-- informes (contrato_id, inspeccion_id, url_pdf)
-- ---------------------------------------------------------------------
drop policy if exists informes_select on public.informes;
create policy informes_select on public.informes
  for select to authenticated
  using (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      where i.id = informes.inspeccion_id
        and puede_ver_vivienda(i.vivienda_id)
    )
    or exists (
      select 1 from public.contratos c
      where c.id = informes.contrato_id
        and c.cliente_id = mi_cliente_id()
    )
  );

drop policy if exists informes_insert on public.informes;
create policy informes_insert on public.informes
  for insert to authenticated
  with check (
    es_admin()
    or exists (
      select 1 from public.inspecciones i
      join public.viviendas v on v.id = i.vivienda_id
      where i.id = informes.inspeccion_id
        and v.tecnico_id = mi_tecnico_id()
    )
  );

drop policy if exists informes_delete_admin on public.informes;
create policy informes_delete_admin on public.informes
  for delete to authenticated
  using (es_admin());

-- ---------------------------------------------------------------------
-- facturas_lineas: se rige por la factura padre.
-- Lectura igual que facturas_select; escritura sólo admin, igual que
-- facturas_write_admin.
-- ---------------------------------------------------------------------
drop policy if exists facturas_lineas_select on public.facturas_lineas;
create policy facturas_lineas_select on public.facturas_lineas
  for select to authenticated
  using (
    es_admin()
    or exists (
      select 1 from public.facturas f
      where f.id = facturas_lineas.factura_id
        and f.cliente_id = mi_cliente_id()
    )
  );

drop policy if exists facturas_lineas_write_admin on public.facturas_lineas;
create policy facturas_lineas_write_admin on public.facturas_lineas
  for all to authenticated
  using (es_admin())
  with check (es_admin());

-- ---------------------------------------------------------------------
-- profiles: faltaba la política de INSERT, así que el registro de usuarios
-- fallaba siempre ("Error creando perfil del usuario").
-- Se permite crear ÚNICAMENTE su propia fila y sólo con rol 'cliente', para
-- que nadie pueda darse de alta como admin.
-- ---------------------------------------------------------------------
drop policy if exists profiles_insert_propio on public.profiles;
create policy profiles_insert_propio on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and rol = 'cliente');

commit;
