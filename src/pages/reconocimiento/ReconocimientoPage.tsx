import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../shared/components';
import type { NavItem } from '../../shared/components';
import { identifyPlantImage, type PlantMatch, type IdentificationResult } from '../../services/plantIdentifierService';
import styles from './ReconocimientoPage.module.css';

// 🌿 1. IMPORTA AQUÍ TU IMAGEN EXCLUSIVA PARA ESTA VISTA:
// (Cambia el nombre del archivo por el de tu imagen guardada en assets)
import miImagenFondoReconocimiento from '../../assets/fondo reconocimiento.jpeg';

const NAV_ITEMS: NavItem[] = [
  { icon: '🏠', label: 'Inicio', href: '/' },
  { icon: '🛡️', label: 'Áreas protegidas', href: '/areas-protegidas' },
  { icon: '🔍', label: 'Reconocimiento de especies', href: '/reconocimiento' },
];

export default function ReconocimientoPage() {
  const navigate = useNavigate();

  // Estados para el método 1 (Reconocimiento por Fotografía)
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);

  // Manejo de carga de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null); 
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  };

  // Ejecutar reconocimiento por IA
  const handleIdentify = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);

    const response = await identifyPlantImage(selectedImage);

    setResult(response);
    setLoading(false);
  };

  return (
    // 🖼️ 2. AQUÍ SE APLICA TU IMAGEN COMO FONDO EXCLUSIVO DE ESTA VISTA:
    <div 
      className={styles.page}
      style={{ 
        backgroundImage: `url(${miImagenFondoReconocimiento})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* Barra superior corporativa estándar idéntica a tus otras vistas */}
      <Navbar brand="Herbario" brandIcon="🌿" items={NAV_ITEMS} />

      <div className={styles.contentWrapper}>
        
        {/* Botón de volver */}
        <div className={styles.topBarSection}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← Volver
          </button>
        </div>

        {/* Encabezado */}
        <header className={styles.headerSection}>
          <h1 className={styles.mainTitle}>Reconocimiento de Especies</h1>
          <p className={styles.subTitle}>Identifica la flora de Colombia mediante visión artificial</p>
        </header>

        {/* MÉTODO 1: RECONOCIMIENTO POR FOTOGRAFÍA */}
        <section className={styles.cardBlock}>
          <h2 className={styles.cardHeaderGreen}>
            <span>📷</span> Reconocimiento por Fotografía
          </h2>
          <p className={styles.sectionDesc}>Carga una imagen de la planta para descubrir su especie y taxonomía.</p>

          {!imagePreview ? (
            <div className={styles.uploadBox}>
              <label htmlFor="plant-file-input" className={styles.uploadLabel}>
                <span>📷 Seleccionar o arrastrar fotografía</span>
                <input 
                  id="plant-file-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <div className={styles.imageWrapper}>
                <img src={imagePreview} alt="Planta a identificar" className={styles.previewImage} />
                <button onClick={handleRemoveImage} className={styles.removeButton}>
                  ✕ Cambiar fotografía
                </button>
              </div>

              <button 
                onClick={handleIdentify} 
                disabled={loading} 
                className={styles.actionButton}
              >
                {loading ? 'Analizando características botánicas...' : '🌿 Reconocer especie'}
              </button>
            </div>
          )}

          {/* Resultados del Reconocimiento */}
          {result && (
            <div className={styles.resultsContainer}>
              {result.success && result.matches.length > 0 ? (
                result.matches.map((match: PlantMatch, index: number) => (
                  <div key={index} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <div>
                        <h3 className={styles.scientificName}>{match.scientificName}</h3>
                        <p className={styles.commonName}>{match.commonName}</p>
                      </div>
                      <div className={styles.confidenceBadge}>
                        {match.confidence}% Confiabilidad
                      </div>
                    </div>

                    <div className={styles.taxonomyBox}>
                      <h4>Taxonomía</h4>
                      <p><strong>Reino:</strong> {match.taxonomy.reino} | <strong>División:</strong> {match.taxonomy.division} | <strong>Clase:</strong> {match.taxonomy.clase}</p>
                      <p><strong>Orden:</strong> {match.taxonomy.orden} | <strong>Familia:</strong> {match.taxonomy.familia} | <strong>Género:</strong> {match.taxonomy.genero}</p>
                    </div>

                    <div className={styles.sourcesBox}>
                      <strong>Fuentes de Referencia:</strong>
                      <ul>
                        {match.sources.map((src, i) => (
                          <li key={i}>{src}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.errorMessage}>
                  {result.message || "No se pudo completar el reconocimiento. Intente nuevamente."}
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}