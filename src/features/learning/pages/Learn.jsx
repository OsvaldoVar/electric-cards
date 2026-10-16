import { gateList } from '../../../data/gates';
import { GateCard } from '../components/GateCard';
import { useProgress } from '../../progression';

export default function Learn() {
  const { unlockedGates } = useProgress();
  return (
    <main className="page learn-page">
      <header className="page-heading">
        <div className="page-heading-copy">
          <h1>Colección de compuertas</h1>
          <p>
            Completa niveles para desbloquear compuertas, relojes y flip-flops. Cada ficha
            explica su regla y te permite experimentar con un simulador interactivo.
          </p>
        </div>
        <div
          className="collection-count mono"
          aria-label={`${unlockedGates.length} de ${gateList.length} componentes desbloqueados`}
        >
          <strong>{unlockedGates.length}</strong> / {gateList.length} desbloqueados
        </div>
      </header>

      <section className="gate-collection" aria-label="Catálogo de compuertas">
        {gateList.map((gate) => (
          <GateCard key={gate.id} gate={gate} unlocked={unlockedGates.includes(gate.id)} />
        ))}
      </section>

      <p className="learning-note">
        Las cartas representan compuertas lógicas digitales. Los personajes son recursos
        didácticos para recordar sus funciones; cada compuerta procesa exclusivamente valores
        discretos 0 y 1.
      </p>
    </main>
  );
}
