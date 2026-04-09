DROP TABLE IF EXISTS diagramas_flujo CASCADE;
DROP TABLE IF EXISTS historial_procedimiento CASCADE;
DROP TABLE IF EXISTS pasos_procedimiento CASCADE;
DROP TABLE IF EXISTS procedimiento_detalle CASCADE;
DROP TABLE IF EXISTS procedimientos CASCADE;
DROP TABLE IF EXISTS inventario_procedimientos CASCADE;
DROP TABLE IF EXISTS competencias_puesto CASCADE;
DROP TABLE IF EXISTS funciones_puesto CASCADE;
DROP TABLE IF EXISTS perfil_puesto CASCADE;
DROP TABLE IF EXISTS descripcion_puesto CASCADE;
DROP TABLE IF EXISTS puestos CASCADE;
DROP TABLE IF EXISTS organigramas CASCADE;
DROP TABLE IF EXISTS marco_conceptual CASCADE;
DROP TABLE IF EXISTS politicas_operacion CASCADE;
DROP TABLE IF EXISTS marco_normativo CASCADE;
DROP TABLE IF EXISTS secciones_manual CASCADE;
DROP TABLE IF EXISTS observaciones CASCADE;
DROP TABLE IF EXISTS historial_versiones CASCADE;
DROP TABLE IF EXISTS manuales CASCADE;
DROP TABLE IF EXISTS bitacora_sistema CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;


CREATE TABLE roles (
    id_rol      SERIAL PRIMARY KEY,
    nombre_rol  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id_usuario      SERIAL PRIMARY KEY,
    id_rol          INT NOT NULL REFERENCES roles(id_rol),
    nombre          VARCHAR(100) NOT NULL,
    correo          VARCHAR(100) NOT NULL UNIQUE,
    contrasena      VARCHAR(255) NOT NULL,
    dependencia     VARCHAR(150),
    cargo           VARCHAR(100),
    telefono        VARCHAR(20),
    fecha_registro  TIMESTAMP DEFAULT NOW(),
    activo          BOOLEAN DEFAULT TRUE
);

CREATE TABLE bitacora_sistema (
    id_bitacora     SERIAL PRIMARY KEY,
    usuario         INT REFERENCES usuarios(id_usuario),
    accion          VARCHAR(100),
    tabla_afectada  VARCHAR(100),
    id_registro     INT,
    fecha           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE manuales (
    id_manual           SERIAL PRIMARY KEY,
    creado_por          INT NOT NULL REFERENCES usuarios(id_usuario),
    tipo_manual         VARCHAR(20) NOT NULL CHECK (tipo_manual IN ('organizacion', 'procedimientos')),
    codigo              VARCHAR(50),
    dependencia         VARCHAR(150),
    version             INT DEFAULT 1,
    fecha_emision       DATE,
    estado              VARCHAR(30) DEFAULT 'borrador'
                            CHECK (estado IN ('borrador','en_revision','observaciones','autorizado','validado')),
    razon_modificacion  TEXT,
    version_anterior    INT,
    fecha_creacion      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE historial_versiones (
    id_historial    SERIAL PRIMARY KEY,
    id_manual       INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    usuario         INT REFERENCES usuarios(id_usuario),
    version         INT,
    fecha           TIMESTAMP DEFAULT NOW(),
    razon_cambio    TEXT
);

CREATE TABLE observaciones (
    id_observacion  SERIAL PRIMARY KEY,
    id_manual       INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    seccion         VARCHAR(100),
    comentario      TEXT,
    emitido_por     INT REFERENCES usuarios(id_usuario),
    fecha           TIMESTAMP DEFAULT NOW(),
    estatus         VARCHAR(20) DEFAULT 'pendiente'
                        CHECK (estatus IN ('pendiente','atendido','rechazado'))
);

CREATE TABLE secciones_manual (
    id_seccion      SERIAL PRIMARY KEY,
    id_manual       INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    tipo_seccion    VARCHAR(50) NOT NULL,
    contenido       TEXT,
    orden           INT
);

CREATE TABLE marco_normativo (
    id_norma            SERIAL PRIMARY KEY,
    id_manual           INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    nombre_norma        VARCHAR(200),
    fecha_publicacion   DATE,
    medio_publicacion   VARCHAR(100)
);

CREATE TABLE politicas_operacion (
    id_politica     SERIAL PRIMARY KEY,
    id_manual       INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    area            VARCHAR(150),
    descripcion     TEXT
);

CREATE TABLE marco_conceptual (
    id_termino      SERIAL PRIMARY KEY,
    id_manual       INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    termino         VARCHAR(150),
    definicion      TEXT
);

CREATE TABLE organigramas (
    id_organigrama  SERIAL PRIMARY KEY,
    id_manual       INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    tipo            VARCHAR(50),
    ruta_archivo    VARCHAR(255)
);

CREATE TABLE puestos (
    id_puesto           SERIAL PRIMARY KEY,
    id_manual           INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    jefe_inmediato_id   INT REFERENCES puestos(id_puesto),
    nombre_puesto       VARCHAR(150),
    titular             VARCHAR(150),
    numero_personas     INT DEFAULT 1
);

CREATE TABLE perfil_puesto (
    id_perfil       SERIAL PRIMARY KEY,
    id_puesto       INT NOT NULL REFERENCES puestos(id_puesto) ON DELETE CASCADE,
    escolaridad     VARCHAR(100),
    carreras_afines TEXT,
    especialidad    TEXT,
    experiencia     TEXT
);

CREATE TABLE funciones_puesto (
    id_funcion      SERIAL PRIMARY KEY,
    id_puesto       INT NOT NULL REFERENCES puestos(id_puesto) ON DELETE CASCADE,
    tipo_funcion    VARCHAR(50),
    descripcion     TEXT
);

CREATE TABLE competencias_puesto (
    id_competencia  SERIAL PRIMARY KEY,
    id_puesto       INT NOT NULL REFERENCES puestos(id_puesto) ON DELETE CASCADE,
    tipo            VARCHAR(50),
    descripcion     TEXT
);

CREATE TABLE subordinados_puesto (
    id_subordinado  SERIAL PRIMARY KEY,
    id_puesto       INT NOT NULL REFERENCES puestos(id_puesto) ON DELETE CASCADE,
    tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('directo', 'indirecto')),
    num_personas    INTEGER DEFAULT 1,
    nombre_puesto   VARCHAR(200) NOT NULL
);

CREATE TABLE descripcion_puesto (
    id_descripcion      SERIAL PRIMARY KEY,
    id_puesto           INT NOT NULL REFERENCES puestos(id_puesto) ON DELETE CASCADE,
    objetivo            TEXT,
    autoridad           TEXT,
    indicador_desempeno TEXT,
    horario             VARCHAR(100),
    manejo_informacion  TEXT,
    nivel_informacion   VARCHAR(10),
    manejo_presupuesto  TEXT,
    nivel_presupuesto   VARCHAR(10),
    ocupante_cargo      VARCHAR(200),
    ocupante_fecha      DATE,
    jefe_firma_nombre   VARCHAR(200),
    jefe_firma_cargo    VARCHAR(200),
    jefe_firma_fecha    DATE
);

CREATE TABLE procedimientos (
    id_procedimiento    SERIAL PRIMARY KEY,
    id_manual           INT NOT NULL REFERENCES manuales(id_manual) ON DELETE CASCADE,
    codigo              VARCHAR(50),
    nombre              VARCHAR(200),
    version             INT DEFAULT 1,
    fecha_emision       DATE,
    tipo                VARCHAR(30) CHECK (tipo IN ('administrativo','tramite_servicio')),
    area_departamento   VARCHAR(150),
    orden               INT
);

CREATE TABLE procedimiento_detalle (
    id_detalle          SERIAL PRIMARY KEY,
    id_procedimiento    INT NOT NULL REFERENCES procedimientos(id_procedimiento) ON DELETE CASCADE,
    objetivo            TEXT,
    alcance             TEXT,
    responsabilidades   TEXT,
    definiciones        TEXT,
    referencias         TEXT,
    registros           TEXT,
    elaboro_nombre      VARCHAR(200),
    reviso_nombre       VARCHAR(200),
    autorizo_nombre     VARCHAR(200),
    valido_nombre       VARCHAR(200)
);

CREATE TABLE pasos_procedimiento (
    id_paso          SERIAL PRIMARY KEY,
    id_procedimiento INT NOT NULL REFERENCES procedimientos(id_procedimiento) ON DELETE CASCADE,
    numero_paso      INT NOT NULL,
    tipo             VARCHAR(20) DEFAULT 'actividad',
    paso_no          INT NULL,
    responsable      VARCHAR(150),
    descripcion      TEXT,
    es_fin           BOOLEAN DEFAULT FALSE
);

CREATE TABLE historial_procedimiento (
    id_historial_proc   SERIAL PRIMARY KEY,
    id_procedimiento    INT NOT NULL REFERENCES procedimientos(id_procedimiento) ON DELETE CASCADE,
    revision_anterior   VARCHAR(20),
    revision_actual     VARCHAR(20),
    razon_modificacion  TEXT,
    fecha_actualizacion DATE
);

CREATE TABLE diagramas_flujo (
    id_diagrama      SERIAL PRIMARY KEY,
    id_procedimiento INT NOT NULL REFERENCES procedimientos(id_procedimiento) ON DELETE CASCADE,
    codigo           VARCHAR(50),
    ruta_archivo     VARCHAR(255),
    version          INT DEFAULT 1,
    fecha            DATE
);


INSERT INTO roles (nombre_rol) VALUES
    ('administrador'),
    ('sujeto_obligado');
