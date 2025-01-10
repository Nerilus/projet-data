from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS
from flask_compress import Compress

file_path = 'spotify_tracks (1).csv'  
df = pd.read_csv(file_path)


app = Flask(__name__)
CORS(app)


Compress(app)

track_index = pd.Series(df.index, index=df['track_id']).to_dict()

# Route pour récupérer toutes les données avec pagination
@app.route('/data', methods=['GET'])
def get_data():
    # Ajouter une pagination via les paramètres query
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    start = (page - 1) * per_page
    end = start + per_page
    
    data = df.iloc[start:end].to_dict(orient='records')  # Limiter les resultats
    return jsonify(data)

# Route pour récupérer un morceau spécifique par son track_id
@app.route('/data/<track_id>', methods=['GET'])
def get_track(track_id):
    index = track_index.get(track_id)
    if index is not None:
        track = df.iloc[index].to_dict()
        return jsonify(track)
    else:
        return jsonify({'error': 'Track not found'}), 404

@app.route('/')
def home():
    return "Bienvenue sur l'API Spotify !"

if __name__ == '__main__':
    app.run(debug=True)
