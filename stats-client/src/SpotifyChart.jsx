import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import './spotify.css';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SpotifyChart = () => {
  const [tracks, setTracks] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [trackDetails, setTrackDetails] = useState(null);

  // Charger toutes les données des morceaux
  useEffect(() => {
    axios
      .get('http://127.0.0.1:5000/data') // Remplacez par l'URL de votre API
      .then((response) => {
        const data = response.data;
        if (data && Array.isArray(data) && data.length > 0) {
          setTracks(data); // Stocker toutes les données JSON dans un tableau d'état

          // Construire les données des graphiques
          const trackNames = data.map((track) => track.track_name || 'Unknown Track');
          const danceability = data.map((track) => track.danceability || 0);
          const energy = data.map((track) => track.energy || 0);
          const tempo = data.map((track) => track.tempo || 0);

          setChartData({
            danceability: {
              labels: trackNames,
              datasets: [
                {
                  label: 'Danceability',
                  data: danceability,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
              ],
            },
            energy: {
              labels: trackNames,
              datasets: [
                {
                  label: 'Energy',
                  data: energy,
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
              ],
            },
            tempo: {
              labels: trackNames,
              datasets: [
                {
                  label: 'Tempo',
                  data: tempo,
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
              ],
            },
          });
        } else {
          setError('No valid data received from the API');
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Failed to fetch data. Please check the API.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Effectuer l'appel pour récupérer un morceau spécifique par son ID
  useEffect(() => {
    if (selectedTrackId) {
      setIsLoading(true);
      axios
        .get(`http://127.0.0.1:5000/data/${selectedTrackId}`)
        .then((response) => {
          const track = response.data;
          if (track && !track.error) {
            setTrackDetails(track); // Sauvegarder les détails du morceau
            setError(null); // Réinitialiser les erreurs
          } else {
            setTrackDetails(null);
            setError('Track not found');
          }
        })
        .catch((err) => {
          console.error('Erreur lors de la récupération des détails du morceau:', err);
          setError('Failed to fetch track data.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedTrackId]);

  return (
    <div className="spotify-chart-container" style={{ padding: '20px' }}>
      <h2>Spotify Tracks - JSON Data Viewer & Charts</h2>

      {isLoading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          {/* Affichage des morceaux dans un tableau */}
          <h3>Track Data Table</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="tracks-table">
              <thead>
                <tr>
                  {Object.keys(tracks[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tracks.map((track, index) => (
                  <tr key={index}>
                    {Object.values(track).map((value, i) => (
                      <td key={i}>
                        {typeof value === 'string' && value.startsWith('http') ? (
                          <a href={value} target="_blank" rel="noopener noreferrer">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interface pour sélectionner un track_id */}
          <div className="track-id-input">
            <label htmlFor="track-id-input">Enter Track ID to get details: </label>
            <input
              id="track-id-input"
              type="text"
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              placeholder="Track ID"
            />
          </div>

          {/* Affichage des détails du morceau spécifique */}
          {trackDetails && (
            <div className="track-details">
              <h3>Track Details</h3>
              <ul>
                {Object.keys(trackDetails).map((key) => (
                  <li key={key}>
                    <strong>{key}:</strong> {trackDetails[key]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Graphique des morceaux basé sur leurs statistiques */}
          <h3 style={{ marginTop: '20px' }}>Charts</h3>

          {chartData && (
            <div className="charts-container">
              <div>
                <h4>Danceability</h4>
                <Bar
                  data={chartData.danceability}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Danceability of Spotify Tracks' },
                    },
                  }}
                />
              </div>
              <div>
                <h4>Energy</h4>
                <Bar
                  data={chartData.energy}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Energy of Spotify Tracks' },
                    },
                  }}
                />
              </div>
              <div>
                <h4>Tempo</h4>
                <Bar
                  data={chartData.tempo}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Tempo of Spotify Tracks' },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotifyChart;
