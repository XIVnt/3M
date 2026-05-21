export default function SobreNosotros() {
  return (
    <div className="sobre-nosotros-container">

      <section className="sobre-nosotros-section reverse-false section-spacing neon-section">
        <img
          src="img/nosotros1.png"
          alt="Nuestro equipo inicialmente"
          className="sobre-nosotros-img"
        />
        <div className="sobre-nosotros-text">
          <h2>Nuestra Historia</h2>
          <p>
            Todo comenzó con un pequeño sueño: ofrecer productos frescos y deliciosos con un toque auténtico. 
            En los primeros días, la marca se llamó <strong>Asados 3M</strong> y se destacaba por colores claros 
            y un enfoque familiar que captaba la atención del público local. Con el tiempo, la marca evolucionó, 
            adoptando tonos más sólidos y representativos, como el rojo, símbolo de sabor, energía y tradición, 
            consolidando nuestra identidad y acercándonos de manera más fuerte a nuestros clientes.
          </p>
        </div>
      </section>

      <section className="sobre-nosotros-section reverse-true section-spacing neon-section">
        <img
          src="img/antiguo-logo.png"
          alt="Nueva historia"
          className="sobre-nosotros-img"
        />
        <div className="sobre-nosotros-text">
          <h2>¿Qué es 3M?</h2>
          <p>
            3M va más allá de un nombre comercial: son las iniciales de las tres mujeres más importantes 
            en la vida del fundador, William Vega. Aunque no todas estén presentes hoy, su legado y 
            memoria viven en cada receta y en cada plato que servimos. Esta identidad familiar le dio 
            un carácter único a la marca, que además se ganó el apodo cariñoso de 
            <strong> "Las Mejores Menestras del Mundo"</strong>, reflejando nuestro compromiso con calidad y sabor.
          </p>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center gap-6 mb-12 actualidad-section section-spacing neon-section">
        <div className="actualidad-img-left">
          <img src="img/antiguo-local.png" alt="Antiguo local" />
        </div>
        <div className="md:w-1/2 text-center text-white sobre-nosotros-text">
          <h2 className="text-3xl mb-4 text-purple-400">En la actualidad</h2>
          <p>
            Nuestro local evolucionó de ser un simple lugar para comer, a un espacio elegante y distintivo, 
            con su característico estilo neón combinando verde, naranja y lila. Han pasado 4 años desde su creación, 
            manteniéndose en auge y ofreciendo la mejor calidad de servicio, dejando una huella memorable en nuestros clientes.
          </p>
        </div>
        <div className="actualidad-img-right">
          <img src="img/nuevo-local.png" alt="Nuevo local" />
        </div>
      </section>

    </div>
  );
}