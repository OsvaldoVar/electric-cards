import { gateList } from '../data/gates';
import { GateCard } from '../components/GateCard/GateCard';

export default function Learn() {
  return (
    <main className="page learn-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">TU COLECCIÓN</span>
          <h1>Siete formas de pensar.</h1>
          <p>
            Cada carta tiene una regla. Conócela, prueba sus entradas y descubre cómo
            combinarla.
          </p>
        </div>
        <span className="collection-count mono">07 / 07 COMPUERTAS</span>
      </div>
      <div className="gate-collection">
        {gateList.map((gate) => (
          <GateCard key={gate.id} gate={gate} />
        ))}
      </div>
      <p className="learning-note">
        Las cartas representan compuertas digitales. Sus personajes son una asociación visual;
        todas trabajan únicamente con señales binarias 0 y 1.
      </p>
    </main>
  );
}
