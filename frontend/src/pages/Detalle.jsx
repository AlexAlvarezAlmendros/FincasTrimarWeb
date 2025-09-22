import { useParams } from 'react-router-dom';

export default function Detalle() {
  const { id } = useParams();
  
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Detalle de Vivienda</h1>
      <p>Página en construcción - Detalle de la vivienda con ID: {id}</p>
    </div>
  );
}