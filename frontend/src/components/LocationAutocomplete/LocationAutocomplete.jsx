import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import './LocationAutocomplete.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Ubicación",
  className = "",
  disabled = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places"]
        });

        const google = await loader.load();
        
        autocompleteService.current = new google.maps.places.AutocompleteService();
        placesService.current = new google.maps.places.PlacesService(
          document.createElement('div')
        );
      } catch (error) {
        console.warn('Google Places API no disponible:', error);
        // Fallback a sugerencias mock si la API no está disponible
      }
    };

    initializeGooglePlaces();
  }, []);

  const getPlacePredictions = async (input) => {
    if (!input || input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Verificar si Google Places está disponible y configurado
      const hasApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY.length > 0;
      
      if (autocompleteService.current && hasApiKey) {
        // Usar Google Places API
        autocompleteService.current.getPlacePredictions({
          input: input,
          componentRestrictions: { country: 'es' }, // Restringir a España
          // Sin restricción de tipos para obtener todos los lugares disponibles (ciudades, pueblos, etc.)
          language: 'es',
          sessionToken: new google.maps.places.AutocompleteSessionToken()
        }, (predictions, status) => {
          setIsLoading(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions = predictions.map(prediction => ({
              place_id: prediction.place_id,
              description: prediction.description,
              main_text: prediction.structured_formatting.main_text,
              secondary_text: prediction.structured_formatting.secondary_text
            }));
            setSuggestions(formattedSuggestions);
          } else {
            setSuggestions([]);
          }
        });
      } else {
        // Fallback a sugerencias mock incluyendo ciudades, pueblos y comarcas
        const mockLocations = [
          // Principales ciudades
          'Barcelona, Barcelona',
          'Madrid, Madrid',
          'Valencia, Valencia',
          'Sevilla, Andalucía',
          'Zaragoza, Aragón',
          'Málaga, Andalucía',
          'Bilbao, País Vasco',
          
          // Provincia de Barcelona - Ciudades medianas
          'Badalona, Barcelona',
          'Hospitalet de Llobregat, Barcelona',
          'Terrassa, Barcelona',
          'Sabadell, Barcelona',
          'Mataró, Barcelona',
          'Santa Coloma de Gramenet, Barcelona',
          'Cornellà de Llobregat, Barcelona',
          'Sant Boi de Llobregat, Barcelona',
          'Rubí, Barcelona',
          'Manresa, Barcelona',
          'Vilanova i la Geltrú, Barcelona',
          'Viladecans, Barcelona',
          'Castelldefels, Barcelona',
          'Granollers, Barcelona',
          'Igualada, Barcelona',
          'Cerdanyola del Vallès, Barcelona',
          'Sant Cugat del Vallès, Barcelona',
          'El Prat de Llobregat, Barcelona',
          'Mollet del Vallès, Barcelona',
          'Esplugues de Llobregat, Barcelona',
          'Sant Feliu de Llobregat, Barcelona',
          'Vic, Barcelona',
          
          // Costa del Maresme - Pueblos costeros Barcelona
          'Sitges, Barcelona',
          'Calella, Barcelona',
          'Pineda de Mar, Barcelona',
          'Calafell, Barcelona',
          'Cubelles, Barcelona',
          'Vilassar de Mar, Barcelona',
          'Premià de Mar, Barcelona',
          'Arenys de Mar, Barcelona',
          'Canet de Mar, Barcelona',
          'Sant Pol de Mar, Barcelona',
          'Malgrat de Mar, Barcelona',
          'Santa Susanna, Barcelona',
          'Tordera, Barcelona',
          'Blanes, Girona',
          
          // Pueblos del interior Barcelona
          'Berga, Barcelona',
          'Puigcerdà, Barcelona',
          'Ripoll, Girona',
          'Olot, Girona',
          'La Seu d\'Urgell, Lleida',
          'Cardedeu, Barcelona',
          'Llinars del Vallès, Barcelona',
          'La Garriga, Barcelona',
          'Argentona, Barcelona',
          'Dosrius, Barcelona',
          'Òrrius, Barcelona',
          'Teià, Barcelona',
          'Alella, Barcelona',
          'Montgat, Barcelona',
          'El Masnou, Barcelona',
          'Premià de Dalt, Barcelona',
          'Vilassar de Dalt, Barcelona',
          'Cabrera de Mar, Barcelona',
          'Cabrils, Barcelona',
          'Llavaneres, Barcelona',
          'Caldes d\'Estrac, Barcelona',
          'Sant Vicenç de Montalt, Barcelona',
          'Arenys de Munt, Barcelona',
          'Dosrius, Barcelona',
          'Sant Iscle de Vallalta, Barcelona',
          'Fogars de Montclús, Barcelona',
          'Sant Celoni, Barcelona',
          'Hostalric, Girona',
          'Vallgorguina, Barcelona',
          'Vilalba Sasserra, Barcelona',
          'Montseny, Barcelona',
          'Arbúcies, Girona',
          'Breda, Girona',
          'Riells i Viabrea, Girona',
          
          // Más pueblos pequeños de Barcelona
          'Castellar del Vallès, Barcelona',
          'Sentmenat, Barcelona',
          'Polinyà, Barcelona',
          'Palau-solità i Plegamans, Barcelona',
          'Lliçà de Vall, Barcelona',
          'Lliçà d\'Amunt, Barcelona',
          'Montornès del Vallès, Barcelona',
          'Montmeló, Barcelona',
          'Parets del Vallès, Barcelona',
          'Caldes de Montbui, Barcelona',
          'Sant Fost de Campsentelles, Barcelona',
          'Martorelles, Barcelona',
          'Ametlla del Vallès, Barcelona',
          'Bigues i Riells, Barcelona',
          'Castellcir, Barcelona',
          'Castellterçol, Barcelona',
          'Centelles, Barcelona',
          'Aiguafreda, Barcelona',
          'Balenyà, Barcelona',
          'Seva, Barcelona',
          'Taradell, Barcelona',
          'Tona, Barcelona',
          'Gurb, Barcelona',
          'Manlleu, Barcelona',
          'Sant Hipòlit de Voltregà, Barcelona',
          'Torelló, Barcelona',
          'Sant Bartomeu del Grau, Barcelona',
          'Rupit i Pruit, Barcelona',
          'Vilanova de Sau, Barcelona',
          'Tavèrnoles, Barcelona',
          'Folgueroles, Barcelona',
          'Les Masies de Voltregà, Barcelona',
          
          // Comarca de l'Anoia - Todos los municipios
          'Anoia, Barcelona',
          'Igualada, Barcelona',
          'Vilanova del Camí, Barcelona',
          'Santa Margarida de Montbui, Barcelona',
          'Òdena, Barcelona',
          'La Pobla de Claramunt, Barcelona',
          'Capellades, Barcelona',
          'Carme, Barcelona',
          'Piera, Barcelona',
          'Masquefa, Barcelona',
          'Abrera, Barcelona',
          'Esparreguera, Barcelona',
          'Collbató, Barcelona',
          'Olesa de Montserrat, Barcelona',
          'Vacarisses, Barcelona',
          'Rellinars, Barcelona',
          'Viladecavalls, Barcelona',
          'Ullastrell, Barcelona',
          'Sant Llorenç Savall, Barcelona',
          'Matadepera, Barcelona',
          'Castellbell i el Vilar, Barcelona',
          'Monistrol de Montserrat, Barcelona',
          'Bruc, Barcelona',
          'Els Hostalets de Pierola, Barcelona',
          'Mediona, Barcelona',
          'Subirats, Barcelona',
          'Gelida, Barcelona',
          'Sant Sadurní d\'Anoia, Barcelona',
          'Torrelavit, Barcelona',
          'Font-rubí, Barcelona',
          'Pontons, Barcelona',
          'Sant Martí Sarroca, Barcelona',
          'Torrelles de Foix, Barcelona',
          'La Llacuna, Barcelona',
          'Cabrera d\'Anoia, Barcelona',
          'Veciana, Barcelona',
          'Jorba, Barcelona',
          'Argençola, Barcelona',
          'Rubió, Barcelona',
          'Copons, Barcelona',
          'Tous, Barcelona',
          'Orpí, Barcelona',
          'Pujalt, Barcelona',
          'Calaf, Barcelona',
          'Calonge de Segarra, Barcelona',
          'Vallbona d\'Anoia, Barcelona',
          'Sant Pere Sallavinera, Barcelona',
          'Aguilar de Segarra, Barcelona',
          'Castellfollit del Boix, Barcelona',
          'Fonollosa, Barcelona',
          'Sant Mateu de Bages, Barcelona',
          'Rajadell, Barcelona',
          
          // Comarca del Bages - Todos los municipios  
          'Bages, Barcelona',
          'Manresa, Barcelona',
          'Súria, Barcelona',
          'Cardona, Barcelona',
          'Solsona, Barcelona',
          'Berga, Barcelona',
          'Puig-reig, Barcelona',
          'Gironella, Barcelona',
          'Casserres, Barcelona',
          'Avià, Barcelona',
          'Cercs, Barcelona',
          'Bagà, Barcelona',
          'Guardiola de Berguedà, Barcelona',
          'La Pobla de Lillet, Barcelona',
          'Castellar de n\'Hug, Barcelona',
          'Saldes, Barcelona',
          'Gósol, Barcelona',
          'Sant Julià de Cerdanyola, Barcelona',
          'Vilada, Barcelona',
          'Borredà, Barcelona',
          'Montclar, Barcelona',
          'Montmajor, Barcelona',
          'Capolat, Barcelona',
          'Fígols, Barcelona',
          'Cercs, Barcelona',
          'Vallcebre, Barcelona',
          'Castellar del Riu, Barcelona',
          'Olvan, Barcelona',
          'Sant Jaume de Frontanyà, Barcelona',
          'Sagàs, Barcelona',
          'Saldes, Barcelona',
          'Bagà, Barcelona',
          'Gisclareny, Barcelona',
          'La Quar, Barcelona',
          'Montmajor, Barcelona',
          'Vilada, Barcelona',
          'Alpens, Barcelona',
          'Lluçà, Barcelona',
          'Oristà, Barcelona',
          'Prats de Lluçanès, Barcelona',
          'Perafita, Barcelona',
          'Lluçà, Barcelona',
          'Santa Maria de Merlès, Barcelona',
          'Sant Boi de Lluçanès, Barcelona',
          'Sobremunt, Barcelona',
          'Olost, Barcelona',
          'Sant Martí d\'Albars, Barcelona',
          'Sant Vicenç de Torelló, Barcelona',
          'Orís, Barcelona',
          'Les Masies de Roda, Barcelona',
          'Roda de Ter, Barcelona',
          'Sant Pere de Torelló, Barcelona',
          'Sant Sadurní d\'Osormort, Barcelona',
          'Calldetenes, Barcelona',
          'Sant Julià de Vilatorta, Barcelona',
          'Malla, Barcelona',
          'Santa Eugènia de Berga, Barcelona',
          'Muntanyola, Barcelona',
          'Sant Bartomeu del Grau, Barcelona',
          'Vilanova de Sau, Barcelona',
          'Tavèrnoles, Barcelona',
          'Folgueroles, Barcelona',
          'Rupit i Pruit, Barcelona',
          
          // Otras comarcas importantes
          'Baix Llobregat, Barcelona',
          'Barcelonès, Barcelona',
          'Garraf, Barcelona',
          'Maresme, Barcelona',
          'Vallès Occidental, Barcelona',
          'Vallès Oriental, Barcelona',
          'Osona, Barcelona',
          'Berguedà, Barcelona',
          'Cerdanya, Girona',
          'Ripollès, Girona',
          'Garrotxa, Girona',
          'Alt Urgell, Lleida',
          'Solsonès, Lleida',
          
          // Tarragona - Costa Dorada y pueblos
          'Tarragona, Tarragona',
          'Reus, Tarragona',
          'Valls, Tarragona',
          'Torredembarra, Tarragona',
          'Cambrils, Tarragona',
          'Salou, Tarragona',
          'Vila-seca, Tarragona',
          'Calafell, Tarragona',
          'Altafulla, Tarragona',
          'El Vendrell, Tarragona',
          'Cunit, Tarragona',
          'Segur de Calafell, Tarragona',
          'Creixell, Tarragona',
          'Roda de Berà, Tarragona',
          'Mont-roig del Camp, Tarragona',
          'Miami Platja, Tarragona',
          'L\'Hospitalet de l\'Infant, Tarragona',
          'Vandellòs, Tarragona',
          'L\'Ametlla de Mar, Tarragona',
          'El Perelló, Tarragona',
          'Deltebre, Tarragona',
          'Sant Jaume d\'Enveja, Tarragona',
          'Amposta, Tarragona',
          'Sant Carles de la Ràpita, Tarragona',
          'Alcanar, Tarragona',
          'Ulldecona, Tarragona',
          'La Sénia, Tarragona',
          'Godall, Tarragona',
          'Masdenverge, Tarragona',
          'Freginals, Tarragona',
          'Tortosa, Tarragona',
          'Roquetes, Tarragona',
          'Aldover, Tarragona',
          'Xerta, Tarragona',
          'Tivenys, Tarragona',
          'Benifallet, Tarragona',
          'L\'Aldea, Tarragona',
          'Camarles, Tarragona',
          'L\'Ampolla, Tarragona',
          'Móra d\'Ebre, Tarragona',
          'Móra la Nova, Tarragona',
          'Tivissa, Tarragona',
          'Duesaigües, Tarragona',
          'Garcia, Tarragona',
          'Ginestar, Tarragona',
          'Ascó, Tarragona',
          'Flix, Tarragona',
          'Riba-roja d\'Ebre, Tarragona',
          'Baix Camp, Tarragona',
          'Tarragonès, Tarragona',
          'Alt Camp, Tarragona',
          'Conca de Barberà, Tarragona',
          'Priorat, Tarragona',
          'Ribera d\'Ebre, Tarragona',
          'Terra Alta, Tarragona',
          'Baix Ebre, Tarragona',
          'Montsià, Tarragona',
          
          // Girona - Costa Brava y pueblos
          'Girona, Girona',
          'Figueres, Girona',
          'Blanes, Girona',
          'Lloret de Mar, Girona',
          'Roses, Girona',
          'Empuriabrava, Girona',
          'Cadaqués, Girona',
          'Palafrugell, Girona',
          'Palamós, Girona',
          'Sant Feliu de Guíxols, Girona',
          'Tossa de Mar, Girona',
          'L\'Escala, Girona',
          'Castell-Platja d\'Aro, Girona',
          'Platja d\'Aro, Girona',
          'S\'Agaró, Girona',
          'Calonge, Girona',
          'Sant Antoni de Calonge, Girona',
          'Begur, Girona',
          'Pals, Girona',
          'Torroella de Montgrí, Girona',
          'L\'Estartit, Girona',
          'Portbou, Girona',
          'Colera, Girona',
          'Llançà, Girona',
          'El Port de la Selva, Girona',
          'Selva de Mar, Girona',
          'Vilajuïga, Girona',
          'Pau, Girona',
          'Peralada, Girona',
          'Castelló d\'Empúries, Girona',
          'Sant Pere Pescador, Girona',
          'Escala, Girona',
          'Verges, Girona',
          'Palau-sator, Girona',
          'Fontanilles, Girona',
          'Forallac, Girona',
          'Vulpellac, Girona',
          'Corçà, Girona',
          'Ullà, Girona',
          'Gualta, Girona',
          'Rupià, Girona',
          'Ullastret, Girona',
          'Olot, Girona',
          'Besalú, Girona',
          'Castellfollit de la Roca, Girona',
          'Santa Pau, Girona',
          'Les Preses, Girona',
          'Maçanet de la Selva, Girona',
          'Vidreres, Girona',
          'Sils, Girona',
          'Caldes de Malavella, Girona',
          'Llagostera, Girona',
          'Santa Cristina d\'Aro, Girona',
          'Solius, Girona',
          'Romanyà de la Selva, Girona',
          'Alt Empordà, Girona',
          'Baix Empordà, Girona',
          'Selva, Girona',
          'Gironès, Girona',
          'Garrotxa, Girona',
          'Ripollès, Girona',
          
          // Lleida - Ciudad y pueblos
          'Lleida, Lleida',
          'Balaguer, Lleida',
          'Mollerussa, Lleida',
          'Tàrrega, Lleida',
          'Cervera, Lleida',
          'Almacelles, Lleida',
          'Agramunt, Lleida',
          'Bellpuig, Lleida',
          'Guissona, Lleida',
          'Solsona, Lleida',
          'Ponts, Lleida',
          'Artesa de Segre, Lleida',
          'Tremp, Lleida',
          'Sort, Lleida',
          'Vielha e Mijaran, Lleida',
          'Bossòst, Lleida',
          'Les, Lleida',
          'Salardú, Lleida',
          'Naut Aran, Lleida',
          'Arties, Lleida',
          'Baqueira, Lleida',
          'Espot, Lleida',
          'Rialp, Lleida',
          'Llavorsí, Lleida',
          'Alàs i Cerc, Lleida',
          'Coll de Nargó, Lleida',
          'Organyà, Lleida',
          'Oliana, Lleida',
          'Ponts, Lleida',
          'Térmens, Lleida',
          'Os de Balaguer, Lleida',
          'Camarasa, Lleida',
          'Àger, Lleida',
          'Segrià, Lleida',
          'Urgell, Lleida',
          'Segarra, Lleida',
          'Noguera, Lleida',
          'Pla d\'Urgell, Lleida',
          'Alt Urgell, Lleida',
          'Cerdanya, Lleida',
          'Pallars Sobirà, Lleida',
          'Pallars Jussà, Lleida',
          'Alta Ribagorça, Lleida',
          'Val d\'Aran, Lleida',
          
          // Otras provincias importantes
          'Alicante, Valencia',
          'Castellón, Valencia',
          'Valencia, Valencia',
          'Benidorm, Alicante',
          'Torrevieja, Alicante',
          'Denia, Alicante',
          'Gandía, Valencia',
          'Sagunto, Valencia',
          'Xàtiva, Valencia',
          'Alcoy, Alicante',
          'Elda, Alicante',
          'Villena, Alicante',
          'Calpe, Alicante',
          'Altea, Alicante',
          
          // Madrid región
          'Alcalá de Henares, Madrid',
          'Fuenlabrada, Madrid',
          'Móstoles, Madrid',
          'Alcorcón, Madrid',
          'Leganés, Madrid',
          'Getafe, Madrid',
          'Torrejón de Ardoz, Madrid',
          'Parla, Madrid',
          'Alcobendas, Madrid',
          'Las Rozas, Madrid',
          'San Sebastián de los Reyes, Madrid',
          'Pozuelo de Alarcón, Madrid',
          'Majadahonda, Madrid',
          'Rivas-Vaciamadrid, Madrid',
          'Coslada, Madrid',
          'Valdemoro, Madrid',
          'Aranjuez, Madrid',
          'El Escorial, Madrid',
          'Colmenar Viejo, Madrid',
          
          // Andalucía
          'Marbella, Málaga',
          'Jerez de la Frontera, Cádiz',
          'Almería, Almería',
          'Huelva, Huelva',
          'Jaén, Jaén',
          'Cádiz, Cádiz',
          'Córdoba, Córdoba',
          'Granada, Granada',
          'Estepona, Málaga',
          'Fuengirola, Málaga',
          'Torremolinos, Málaga',
          'Benalmádena, Málaga',
          'Mijas, Málaga',
          
          // País Vasco
          'San Sebastián, Gipuzkoa',
          'Vitoria-Gasteiz, Álava',
          'Bilbao, Bizkaia',
          'Barakaldo, Bizkaia',
          'Getxo, Bizkaia',
          'Irun, Gipuzkoa',
          'Portugalete, Bizkaia',
          
          // Galicia
          'A Coruña, A Coruña',
          'Vigo, Pontevedra',
          'Santiago de Compostela, A Coruña',
          'Ourense, Ourense',
          'Lugo, Lugo',
          'Ferrol, A Coruña',
          'Pontevedra, Pontevedra',
          
          // Otras regiones
          'Murcia, Murcia',
          'Cartagena, Murcia',
          'Palma, Baleares',
          'Ibiza, Baleares',
          'Mahón, Baleares',
          'Las Palmas de Gran Canaria, Las Palmas',
          'Santa Cruz de Tenerife, Santa Cruz de Tenerife',
          'Santander, Cantabria',
          'Oviedo, Asturias',
          'Gijón, Asturias',
          'Pamplona, Navarra',
          'Logroño, La Rioja',
          'Valladolid, Valladolid',
          'Salamanca, Salamanca',
          'León, León',
          'Burgos, Burgos',
          'Palencia, Palencia',
          'Zamora, Zamora',
          'Ávila, Ávila',
          'Segovia, Segovia',
          'Soria, Soria',
          'Toledo, Toledo',
          'Ciudad Real, Ciudad Real',
          'Albacete, Albacete',
          'Cuenca, Cuenca',
          'Guadalajara, Guadalajara',
          'Cáceres, Cáceres',
          'Badajoz, Badajoz',
          'Mérida, Badajoz',
          'Teruel, Teruel',
          'Huesca, Huesca'
        ];

        const filtered = mockLocations
          .filter(location => location.toLowerCase().includes(input.toLowerCase()))
          .slice(0, 8) // Aumentamos a 8 resultados para más opciones
          .map((location, index) => ({
            place_id: `mock_${index}`,
            description: location,
            main_text: location.split(',')[0],
            secondary_text: location.split(',')[1]?.trim() || ''
          }));

        setSuggestions(filtered);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error getting place predictions:', error);
      setIsLoading(false);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue !== value) {
      // Debounce para evitar demasiadas llamadas
      if (window.locationDebounceTimeout) {
        clearTimeout(window.locationDebounceTimeout);
      }
      
      window.locationDebounceTimeout = setTimeout(() => {
        getPlacePredictions(newValue);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }, 300);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.main_text);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Retrasar el cierre para permitir clicks en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  return (
    <div className={`location-autocomplete ${className}`}>
      <div className="location-input-container">
        <div className="field-icon"><FontAwesomeIcon icon="fa-solid fa-location-dot" /></div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="location-input"
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul 
          className="suggestions-list"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="suggestion-main">{suggestion.main_text}</div>
              {suggestion.secondary_text && (
                <div className="suggestion-secondary">{suggestion.secondary_text}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <ul className="suggestions-list">
          <li className="suggestion-item no-results">
            No se encontraron ubicaciones
          </li>
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;