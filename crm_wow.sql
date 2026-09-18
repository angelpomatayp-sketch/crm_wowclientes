-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-09-2026 a las 00:22:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `crm_wow`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades`
--

CREATE TABLE `actividades` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `contacto_id` int(11) DEFAULT NULL,
  `ejecutivo_id` int(11) NOT NULL,
  `tipo` enum('llamada','reunion','visita','seguimiento','email') NOT NULL,
  `fecha` datetime NOT NULL,
  `duracion_min` int(11) DEFAULT NULL,
  `asunto` varchar(200) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `resultado` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_cliente_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `tipo_cliente_id`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Ministerio de Cultura', 1, 1, '2026-03-05 21:02:49', '2026-03-05 21:02:49'),
(2, 'Automóviles', 2, 1, '2026-03-09 12:25:13', '2026-03-09 12:25:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `ruc` varchar(11) NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `nombre_comercial` varchar(200) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `web` varchar(200) DEFAULT NULL,
  `ejecutivo_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `tipo_cliente` varchar(50) DEFAULT NULL,
  `estado_cliente` enum('prospecto','cliente') NOT NULL DEFAULT 'prospecto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `ruc`, `razon_social`, `nombre_comercial`, `direccion`, `telefono`, `web`, `ejecutivo_id`, `activo`, `fecha_registro`, `created_at`, `updated_at`, `categoria`, `tipo_cliente`, `estado_cliente`) VALUES
(1, '10703543753', 'POMATAY PAQUIYAURI ANGEL MIGUEL', 'POMATAY PAQUIYAURI ANGEL MIGUEL', 'Av. Plaza Principal de Lima', '958017157', 'www.minedu.cultura.gob.pe', 2, 1, '2026-03-06', '2026-03-05 21:03:59', '2026-03-05 21:03:59', 'Ministerio de Cultura', 'Gobierno', 'prospecto'),
(2, '20211377748', 'NOR AUTOS CHICLAYO S.A.C.', 'NOR AUTOS CHICLAYO', 'AV. JUAN THOMIS NRO 199 URB. QUIÑONES ', '987654321', 'www.norautos.pe', 2, 1, '2026-03-09', '2026-03-09 12:25:53', '2026-03-09 19:06:45', 'Automóviles', 'DEALER DE AUTOS', 'prospecto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

CREATE TABLE `contactos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `contacto_principal` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `contactos`
--

INSERT INTO `contactos` (`id`, `cliente_id`, `nombre`, `cargo`, `area`, `correo`, `telefono`, `celular`, `contacto_principal`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Juan Perez Taipe', 'Gerente General', 'Gerencia', 'juan.perez@minedu.gob.pe', '', '951753123', 1, 1, '2026-03-05 21:04:55', '2026-03-05 21:04:55'),
(2, 1, 'Ana Maria Benavidez Quintana', 'Jefa de Logistica', 'Abastecimiento', 'ana.benavidez@minedu.gob.pe', '', '987456321', 0, 1, '2026-03-05 21:06:08', '2026-03-05 21:06:08'),
(3, 2, 'Vanesa Zevallos', 'Gerenta General', 'Gerencia', 'amvzevallos@norautos.com.pe', '', '950110213', 1, 1, '2026-03-09 12:27:46', '2026-03-09 12:27:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizaciones`
--

CREATE TABLE `cotizaciones` (
  `id` int(11) NOT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `cliente_id` int(11) NOT NULL,
  `contacto_id` int(11) DEFAULT NULL,
  `ejecutivo_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `moneda` enum('PEN','USD') NOT NULL DEFAULT 'PEN',
  `subtotal` decimal(12,2) DEFAULT 0.00,
  `igv` decimal(12,2) DEFAULT 0.00,
  `monto` decimal(12,2) DEFAULT 0.00,
  `estado` enum('borrador','enviado','aprobado','rechazado') DEFAULT 'borrador',
  `archivo_pdf` varchar(300) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `archivo_propuesta_pdf` varchar(300) DEFAULT NULL,
  `tipo` enum('venta','alquiler') NOT NULL DEFAULT 'venta'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_items`
--

CREATE TABLE `cotizacion_items` (
  `id` int(11) NOT NULL,
  `cotizacion_id` int(11) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `cantidad` decimal(10,2) DEFAULT 1.00,
  `precio_unitario` decimal(12,2) DEFAULT 0.00,
  `subtotal` decimal(12,2) DEFAULT 0.00,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejecutivos`
--

CREATE TABLE `ejecutivos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','ejecutivo') DEFAULT 'ejecutivo',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ejecutivos`
--

INSERT INTO `ejecutivos` (`id`, `nombre`, `apellido`, `email`, `password`, `rol`, `activo`, `created_at`, `updated_at`) VALUES
(2, 'Angel Miguel', 'Pomatay Paquiyauri', 'angel.pomatay.p@gmail.com', '$2a$10$JqUCKKk1USgB54oEeo9UXelLyPIO8t0YscUVofzcl7mFugsJK/YXq', 'ejecutivo', 1, '2026-03-05 16:19:23', '2026-03-05 16:19:23'),
(3, 'Mario', 'Eguren', 'mario.egurem@gmail.com', '$2a$10$JJ.xZ49AmVpCxDreKPKOIO5jSxUhhHZvfcEP5oN7lQdzrPH/dTYSS', 'ejecutivo', 1, '2026-03-06 15:39:41', '2026-03-06 15:39:41'),
(4, 'Admin', 'Sistema', 'admin@wowtechperu.com', '$2a$10$MZmSOw6ln2O7QN4dk/9DcOzrzuvcmgXN2fXar.C3VKRtYJzfc1gCm', 'admin', 1, '2026-05-14 17:47:29', '2026-05-14 17:47:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `numero_factura` varchar(20) DEFAULT NULL,
  `cliente_id` int(11) NOT NULL,
  `orden_id` int(11) DEFAULT NULL,
  `ejecutivo_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `subtotal` decimal(12,2) DEFAULT NULL,
  `igv` decimal(12,2) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL,
  `moneda` enum('PEN','USD') NOT NULL DEFAULT 'PEN',
  `archivo_pdf` varchar(300) DEFAULT NULL,
  `archivo_xml` varchar(300) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

CREATE TABLE `marcas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `web` varchar(200) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marcas`
--

INSERT INTO `marcas` (`id`, `nombre`, `descripcion`, `web`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'SAMSUMG', 'MONITORES SAMSUMG', 'WWW.SAMSUMG.COM', 1, '2026-03-10 12:49:29', '2026-03-10 12:49:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca_contactos`
--

CREATE TABLE `marca_contactos` (
  `id` int(11) NOT NULL,
  `marca_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `contacto_principal` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marca_contactos`
--

INSERT INTO `marca_contactos` (`id`, `marca_id`, `nombre`, `cargo`, `correo`, `telefono`, `celular`, `contacto_principal`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Rosa Bellido', 'Jefa de distribución', 'rosa.bellido@gmail.com', '', '963852159', 1, 1, '2026-03-10 12:56:36', '2026-03-10 12:56:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oportunidades`
--

CREATE TABLE `oportunidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `contacto_id` int(11) DEFAULT NULL,
  `ejecutivo_id` int(11) NOT NULL,
  `etapa` enum('prospecto','cotizado','negociacion','ganado','perdido') DEFAULT 'prospecto',
  `monto_estimado` decimal(12,2) DEFAULT NULL,
  `probabilidad` int(11) DEFAULT 0,
  `fecha_cierre_est` date DEFAULT NULL,
  `cotizacion_id` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(50) DEFAULT NULL,
  `cliente_id` int(11) NOT NULL,
  `cotizacion_id` int(11) DEFAULT NULL,
  `ejecutivo_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) DEFAULT NULL,
  `archivo_orden` varchar(300) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `ruc` varchar(11) DEFAULT NULL,
  `razon_social` varchar(200) NOT NULL,
  `nombre_comercial` varchar(200) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `web` varchar(200) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `ruc`, `razon_social`, `nombre_comercial`, `direccion`, `telefono`, `web`, `activo`, `created_at`, `updated_at`, `descripcion`) VALUES
(1, '10703543751', 'DEL SOLUCIONES', 'DEL CORPOT', 'AV. SAN AGUTIN #85 PISO 2', '951456123', 'www.delsolutions.com', 1, '2026-03-10 12:55:14', '2026-03-10 15:54:33', 'Venta y alquileres de Equipos de computo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor_contactos`
--

CREATE TABLE `proveedor_contactos` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `contacto_principal` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor_contactos`
--

INSERT INTO `proveedor_contactos` (`id`, `proveedor_id`, `nombre`, `cargo`, `correo`, `telefono`, `celular`, `contacto_principal`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 'LUIS VELAZQUES', 'Gerente de Ventas', 'luis.velasques@gmail.com', '', '95179654', 1, 1, '2026-03-10 12:55:59', '2026-03-10 12:55:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recordatorios`
--

CREATE TABLE `recordatorios` (
  `id` int(11) NOT NULL,
  `ejecutivo_id` int(11) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `descripcion` text NOT NULL,
  `completado` tinyint(1) DEFAULT 0,
  `notificado` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20260310_001_add_estado_cliente_and_cotizacion_fields.js'),
('20260310_002_create_proveedores_marcas.js'),
('20260310_003_add_oportunidades_contacto_fk.js'),
('20260310_004_add_cotizacion_tipo.js'),
('20260310_005_add_proveedor_descripcion.js'),
('20260514_006_add_indexes_and_fk_constraints.js'),
('20260514_007_add_moneda_to_facturas.js');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_cliente`
--

CREATE TABLE `tipos_cliente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipos_cliente`
--

INSERT INTO `tipos_cliente` (`id`, `nombre`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Gobierno', 1, '2026-03-05 16:54:03', '2026-03-05 16:54:03'),
(2, 'DEALER DE AUTOS', 1, '2026-03-09 12:24:47', '2026-03-09 12:24:47');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_actividades_cliente_id` (`cliente_id`),
  ADD KEY `idx_actividades_ejecutivo_id` (`ejecutivo_id`),
  ADD KEY `idx_actividades_contacto_id` (`contacto_id`),
  ADD KEY `idx_actividades_fecha` (`fecha`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ruc` (`ruc`),
  ADD KEY `idx_clientes_ejecutivo_id` (`ejecutivo_id`),
  ADD KEY `idx_clientes_estado` (`estado_cliente`),
  ADD KEY `idx_clientes_activo` (`activo`);

--
-- Indices de la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contactos_cliente_id` (`cliente_id`),
  ADD KEY `idx_contactos_activo` (`activo`);

--
-- Indices de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `idx_cotizaciones_cliente_id` (`cliente_id`),
  ADD KEY `idx_cotizaciones_ejecutivo_id` (`ejecutivo_id`),
  ADD KEY `idx_cotizaciones_contacto_id` (`contacto_id`),
  ADD KEY `idx_cotizaciones_estado` (`estado`);

--
-- Indices de la tabla `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cotizacion_id` (`cotizacion_id`);

--
-- Indices de la tabla `ejecutivos`
--
ALTER TABLE `ejecutivos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_factura` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_2` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_3` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_4` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_5` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_6` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_7` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_8` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_9` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_10` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_11` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_12` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_13` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_14` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_15` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_16` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_17` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_18` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_19` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_20` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_21` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_22` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_23` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_24` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_25` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_26` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_27` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_28` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_29` (`numero_factura`),
  ADD UNIQUE KEY `numero_factura_30` (`numero_factura`),
  ADD KEY `idx_facturas_cliente_id` (`cliente_id`),
  ADD KEY `idx_facturas_ejecutivo_id` (`ejecutivo_id`),
  ADD KEY `idx_facturas_orden_id` (`orden_id`);

--
-- Indices de la tabla `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_marcas_activo` (`activo`);

--
-- Indices de la tabla `marca_contactos`
--
ALTER TABLE `marca_contactos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_marca_contactos_marca` (`marca_id`);

--
-- Indices de la tabla `oportunidades`
--
ALTER TABLE `oportunidades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oportunidades_ibfk_contacto` (`contacto_id`),
  ADD KEY `idx_oportunidades_cliente_id` (`cliente_id`),
  ADD KEY `idx_oportunidades_ejecutivo_id` (`ejecutivo_id`),
  ADD KEY `idx_oportunidades_cotizacion_id` (`cotizacion_id`),
  ADD KEY `idx_oportunidades_etapa` (`etapa`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_orden` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_2` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_3` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_4` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_5` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_6` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_7` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_8` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_9` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_10` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_11` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_12` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_13` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_14` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_15` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_16` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_17` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_18` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_19` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_20` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_21` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_22` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_23` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_24` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_25` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_26` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_27` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_28` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_29` (`numero_orden`),
  ADD UNIQUE KEY `numero_orden_30` (`numero_orden`),
  ADD KEY `idx_ordenes_cliente_id` (`cliente_id`),
  ADD KEY `idx_ordenes_ejecutivo_id` (`ejecutivo_id`),
  ADD KEY `idx_ordenes_cotizacion_id` (`cotizacion_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ruc` (`ruc`),
  ADD KEY `idx_proveedores_activo` (`activo`);

--
-- Indices de la tabla `proveedor_contactos`
--
ALTER TABLE `proveedor_contactos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_proveedor_contactos_proveedor` (`proveedor_id`);

--
-- Indices de la tabla `recordatorios`
--
ALTER TABLE `recordatorios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recordatorios_ejecutivo_id` (`ejecutivo_id`),
  ADD KEY `idx_recordatorios_cliente_id` (`cliente_id`),
  ADD KEY `idx_recordatorios_completado` (`completado`);

--
-- Indices de la tabla `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `tipos_cliente`
--
ALTER TABLE `tipos_cliente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `nombre_2` (`nombre`),
  ADD UNIQUE KEY `nombre_3` (`nombre`),
  ADD UNIQUE KEY `nombre_4` (`nombre`),
  ADD UNIQUE KEY `nombre_5` (`nombre`),
  ADD UNIQUE KEY `nombre_6` (`nombre`),
  ADD UNIQUE KEY `nombre_7` (`nombre`),
  ADD UNIQUE KEY `nombre_8` (`nombre`),
  ADD UNIQUE KEY `nombre_9` (`nombre`),
  ADD UNIQUE KEY `nombre_10` (`nombre`),
  ADD UNIQUE KEY `nombre_11` (`nombre`),
  ADD UNIQUE KEY `nombre_12` (`nombre`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ejecutivos`
--
ALTER TABLE `ejecutivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `marca_contactos`
--
ALTER TABLE `marca_contactos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `oportunidades`
--
ALTER TABLE `oportunidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `proveedor_contactos`
--
ALTER TABLE `proveedor_contactos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `recordatorios`
--
ALTER TABLE `recordatorios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipos_cliente`
--
ALTER TABLE `tipos_cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `actividades_ibfk_88` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `actividades_ibfk_89` FOREIGN KEY (`contacto_id`) REFERENCES `contactos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `actividades_ibfk_90` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_actividades_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_actividades_ejecutivo` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_clientes_ejecutivo` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD CONSTRAINT `contactos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contactos_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD CONSTRAINT `cotizaciones_ibfk_88` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cotizaciones_ibfk_89` FOREIGN KEY (`contacto_id`) REFERENCES `contactos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cotizaciones_ibfk_90` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cotizaciones_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cotizaciones_ejecutivo` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  ADD CONSTRAINT `cotizacion_items_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_88` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `facturas_ibfk_89` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `facturas_ibfk_90` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_facturas_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_facturas_ejecutivo` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `marca_contactos`
--
ALTER TABLE `marca_contactos`
  ADD CONSTRAINT `fk_marca_contactos_marca` FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `oportunidades`
--
ALTER TABLE `oportunidades`
  ADD CONSTRAINT `fk_oportunidades_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_oportunidades_ejecutivo` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `oportunidades_ibfk_88` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `oportunidades_ibfk_89` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `oportunidades_ibfk_90` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `oportunidades_ibfk_contacto` FOREIGN KEY (`contacto_id`) REFERENCES `contactos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `fk_ordenes_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ordenes_ejecutivo` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ordenes_ibfk_88` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ordenes_ibfk_89` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ordenes_ibfk_90` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `proveedor_contactos`
--
ALTER TABLE `proveedor_contactos`
  ADD CONSTRAINT `fk_proveedor_contactos_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `recordatorios`
--
ALTER TABLE `recordatorios`
  ADD CONSTRAINT `fk_recordatorios_ejecutivo` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `recordatorios_ibfk_59` FOREIGN KEY (`ejecutivo_id`) REFERENCES `ejecutivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recordatorios_ibfk_60` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
