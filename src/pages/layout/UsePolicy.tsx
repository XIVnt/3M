export default function UsePolicy() {
  return (
    <div className="policy-container">
      <h1>📜 Términos y Condiciones de Uso</h1>

      <p>
        Bienvenido a nuestra plataforma de pedidos de comida rápida. Al acceder
        y utilizar este sistema, aceptas los siguientes términos y condiciones.
      </p>

      <h2>1. Uso de la plataforma</h2>
      <p>
        Esta aplicación permite a los usuarios realizar pedidos de comida de
        forma rápida y sencilla, ya sea para consumo en local o a domicilio.
      </p>
      <p>
        El usuario se compromete a utilizar la plataforma de forma responsable y
        conforme a la legislación vigente.
      </p>

      <h2>2. Registro de usuarios</h2>
      <p>
        Para realizar pedidos es necesario registrarse con datos verídicos como
        nombre, correo electrónico y número de teléfono.
      </p>
      <p>
        El usuario es responsable de mantener la confidencialidad de su cuenta y
        credenciales de acceso.
      </p>

      <h2>3. Pedidos, pagos y disponibilidad</h2>
      <p>
        Todos los pedidos están sujetos a disponibilidad de productos y tiempos
        de preparación del restaurante.
      </p>

      <h2>4. Cancelaciones y penalizaciones</h2>

      <p>
        Las cancelaciones de pedidos estarán sujetas a las siguientes condiciones:
      </p>

      <ul>
        <li>
          <strong>Pedidos pagados con tarjeta:</strong> en caso de cancelación,
          se aplicará una penalización del 30% del importe total pagado. Esta
          medida cubre los gastos de procesamiento del pago y posibles costes
          operativos asociados a la preparación o salida del pedido.
        </li>

        <li>
          <strong>Pedidos a domicilio pagados en efectivo:</strong> si el
          usuario cancela de forma reiterada o injustificada este tipo de
          pedidos, la cuenta podrá ser restringida temporalmente por motivos de
          seguridad y control del servicio.
        </li>
      </ul>

      <h2>5. Responsabilidad del usuario</h2>
      <ul>
        <li>Proporcionar información verídica al registrarse y realizar pedidos</li>
        <li>No suplantar identidades</li>
        <li>No intentar acceder a cuentas ajenas</li>
        <li>No manipular el sistema de pedidos</li>
      </ul>

      <h2>6. Modificación de datos</h2>
      <p>
        El usuario puede modificar sus datos personales (como teléfono o
        contraseña) desde su perfil o mediante los mecanismos de verificación
        habilitados en la plataforma.
      </p>

      <h2>7. Suspensión de cuentas</h2>
      <p>
        Nos reservamos el derecho de suspender o restringir cuentas en caso de
        uso indebido, fraude, cancelaciones abusivas o comportamiento
        sospechoso que afecte al servicio.
      </p>

      <h2>8. Propiedad del servicio</h2>
      <p>
        La plataforma, su diseño, código y funcionalidades son propiedad del
        restaurante y no pueden ser copiados o reutilizados sin autorización.
      </p>

      <h2>9. Cambios en los términos</h2>
      <p>
        Estos términos pueden actualizarse en cualquier momento para mejorar el
        servicio o adaptarse a cambios operativos o legales. El uso continuado
        implica la aceptación de los cambios.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para cualquier duda sobre estos términos, el usuario puede contactar con
        el soporte del restaurante a través de los canales oficiales.
      </p>

      <br />

      <p className="policy-footer">
        Última actualización: {new Date().getFullYear()}
      </p>
    </div>
  );
}