import { motion } from "framer-motion";

export default function DatesPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
    <div className="policy-container">
      <h1>🔒 Política de Protección de Datos</h1>

      <p>
        En cumplimiento de la normativa aplicable en Ecuador sobre protección de
        datos personales, informamos a los usuarios de nuestra plataforma cómo
        gestionamos su información.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos es el restaurante, cuyo
        objetivo es ofrecer servicios de comida rápida y gestión de pedidos a
        través de esta plataforma.
      </p>

      <h2>2. Datos que recopilamos</h2>
      <p>Únicamente recopilamos los siguientes datos:</p>
      <ul>
        <li>Nombre de usuario</li>
        <li>Correo electrónico</li>
        <li>Número de teléfono (opcional o modificable)</li>
        <li>Historial de pedidos realizados</li>
      </ul>

      <h2>3. Finalidad del uso de datos</h2>
      <p>Los datos se utilizan exclusivamente para:</p>
      <ul>
        <li>Permitir el registro y autenticación de usuarios</li>
        <li>Gestionar pedidos realizados dentro del sistema</li>
        <li>Facilitar la comunicación con el cliente en relación a sus pedidos</li>
      </ul>

      <p>
        No realizamos tratamientos adicionales como publicidad masiva, cesión a
        terceros o análisis comercial externo.
      </p>

      <h2>4. Conservación de los datos</h2>
      <p>
        Los datos se conservan mientras el usuario mantenga su cuenta activa o
        mientras sean necesarios para la prestación del servicio.
      </p>

      <h2>5. Derechos del usuario</h2>
      <p>
        El usuario puede en cualquier momento:
      </p>
      <ul>
        <li>Acceder a sus datos personales</li>
        <li>Modificar su información (nombre, teléfono, etc.)</li>
        <li>Solicitar la eliminación de su cuenta</li>
      </ul>

      <p>
        Estos cambios pueden realizarse directamente desde la plataforma o
        mediante solicitud al soporte del sistema.
      </p>

      <h2>6. Seguridad de los datos</h2>
      <p>
        Implementamos medidas de seguridad técnicas y organizativas para
        proteger los datos contra accesos no autorizados, pérdida o uso indebido.
      </p>

      <h2>7. Cambios en la política</h2>
      <p>
        Nos reservamos el derecho de actualizar esta política para adaptarla a
        mejoras del sistema o cambios legales. Se recomienda revisarla
        periódicamente.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para cualquier consulta relacionada con datos personales, el usuario
        puede contactar con el equipo del restaurante a través de los canales
        oficiales de soporte.
      </p>

      <br />

      <p className="policy-footer">
        Última actualización: {new Date().getFullYear()}
      </p>
    </div>
    </motion.div>
  );
}