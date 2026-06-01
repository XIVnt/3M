import { motion } from "framer-motion";

export default function SobreNosotros() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <div className="about-page">

        {/* HERO */}
        <section className="about-hero">
          <h1>Sobre Nosotros</h1>
          <p>
            Una historia de evolución, familia y sabor que define a 3M
          </p>
        </section>

        {/* HISTORIA */}
        <section className="about-block">
          <div className="about-card">
            <img src="img/nosotros1.png" alt="Nuestro equipo inicialmente" />
            <div>
              <h2>Nuestra Historia</h2>
              <p>
                Todo comenzó con un pequeño sueño: ofrecer productos frescos y deliciosos con un toque auténtico.
                En los primeros días, la marca se llamó <strong>Asados 3M</strong> y se destacaba por colores claros
                y un enfoque familiar que captaba la atención del público local. Con el tiempo, la marca evolucionó,
                adoptando tonos más sólidos y representativos, como el rojo, símbolo de sabor, energía y tradición,
                consolidando nuestra identidad y acercándonos de manera más fuerte a nuestros clientes.
              </p>
            </div>
          </div>
        </section>

        {/* IDENTIDAD */}
        <section className="about-block reverse">
          <div className="about-card">
            <img src="img/antiguo-logo.png" alt="Nueva historia" />
            <div>
              <h2>¿Qué es 3M?</h2>
              <p>
                3M va más allá de un nombre comercial: son las iniciales de las tres mujeres más importantes
                en la vida del fundador, William Vega. Aunque no todas estén presentes hoy, su legado y
                memoria viven en cada receta y en cada plato que servimos. Esta identidad familiar le dio
                un carácter único a la marca, que además se ganó el apodo cariñoso de
                <strong> "Las Mejores Menestras del Mundo"</strong>, reflejando nuestro compromiso con calidad y sabor.
              </p>
            </div>
          </div>
        </section>

        {/* EVOLUCIÓN */}
        <section className="about-evolution">

          <h2 className="section-title">En la actualidad</h2>

          <div className="evo-grid">

            <div className="evo-item">
              <img src="img/antiguo-local.png" alt="Antiguo local" />
              <span>Antes</span>
            </div>

            <div className="evo-arrow">➜</div>

            <div className="evo-item highlight">
              <img src="img/nuevo-local.png" alt="Nuevo local" />
              <span>Ahora</span>
            </div>

          </div>

          <p className="evo-text">
            Nuestro local evolucionó de ser un simple lugar para comer, a un espacio elegante y distintivo,
            con su característico estilo neón combinando verde, naranja y lila. Han pasado 4 años desde su creación,
            manteniéndose en auge y ofreciendo la mejor calidad de servicio, dejando una huella memorable en nuestros clientes.
          </p>

        </section>

      </div>
    </motion.div>
  );
}