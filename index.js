require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_COLLECTION;

let db;
let playersCollection;

// Connect to MongoDB
MongoClient.connect(mongoUri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    playersCollection = db.collection(collectionName);
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// Middleware
app.use(express.json());

// Simple API endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

// Search players by name (autocomplete) - NUEVO
app.get('/api/search/players', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!playersCollection) {
      return res.status(503).json({ error: 'Database connection not ready' });
    }

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    // Case-insensitive search with regex - busca por nombre o apellido
    const searchRegex = new RegExp(q, 'i');
    
    const players = await playersCollection
      .find({ strPlayer: searchRegex })
      .limit(parseInt(limit))
      .project({ strPlayer: 1, _id: 0 })
      .toArray();

    res.json(players);
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get player by name endpoint
app.get('/api/player/:name', async (req, res) => {
  try {
    const playerName = req.params.name;
    
    if (!playersCollection) {
      return res.status(503).json({ error: 'Database connection not ready' });
    }

    // Search for player by strPlayer field
    const player = await playersCollection.findOne({ strPlayer: playerName });

    if (!player) {
      return res.status(404).json({ error: 'Player not found', playerName });
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1. Top scorers - Mayores goleadores
app.get('/api/top-goleadores', async (req, res) => {
  try {
    if (!playersCollection) {
      return res.status(503).json({ error: 'Database connection not ready' });
    }

    const topScorers = await playersCollection
      .find({ Gls: { $exists: true, $ne: null } })
      .sort({ Gls: -1 })
      .limit(20)
      .project({ strPlayer: 1, strCutout: 1, Gls: 1, _id: 0 })
      .toArray();

    res.json(topScorers);
  } catch (error) {
    console.error('Error fetching top scorers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Top goalkeepers - Arqueros con más vallas invictas
app.get('/api/top-goleros', async (req, res) => {
  try {
    if (!playersCollection) {
      return res.status(503).json({ error: 'Database connection not ready' });
    }

    const topGoalkeepers = await playersCollection
      .find({ CS: { $exists: true, $ne: null } })
      .sort({ CS: -1 })
      .limit(20)
      .project({ strPlayer: 1, strCutout: 1, CS: 1, _id: 0 })
      .toArray();

    res.json(topGoalkeepers);
  } catch (error) {
    console.error('Error fetching top goalkeepers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Top defenders - Defensores con mayor eficacia en barridas
app.get('/api/top-defensas', async (req, res) => {
  try {
    if (!playersCollection) {
      return res.status(503).json({ error: 'Database connection not ready' });
    }

    const defenders = await playersCollection
      .find({
        strPosition: { $in: ['Center-Back', 'Left-Back', 'Right-Back'] },
        Tkl: { $gt: 20 },
        TklW: { $exists: true, $ne: null }
      })
      .project({ strPlayer: 1, strCutout: 1, Tkl: 1, TklW: 1, strPosition: 1, _id: 0 })
      .toArray();

    // Calculate tackle efficiency percentage
    const defendersWithEfficiency = defenders.map(defender => ({
      strPlayer: defender.strPlayer,
      strCutout: defender.strCutout,
      tackleEfficiency: ((defender.TklW / defender.Tkl) * 100).toFixed(2),
      Tkl: defender.Tkl,
      TklW: defender.TklW,
      strPosition: defender.strPosition
    }));

    // Sort by efficiency and get top 20
    defendersWithEfficiency.sort((a, b) => b.tackleEfficiency - a.tackleEfficiency);
    const topDefenders = defendersWithEfficiency.slice(0, 20);

    res.json(topDefenders);
  } catch (error) {
    console.error('Error fetching top defenders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Top touches - Jugadores con mayor contacto de balón
app.get('/api/top-touches', async (req, res) => {
  try {
    if (!playersCollection) {
      return res.status(503).json({ error: 'Database connection not ready' });
    }

    const topTouches = await playersCollection
      .find({ Touches: { $exists: true, $ne: null } })
      .sort({ Touches: -1 })
      .limit(20)
      .project({ strPlayer: 1, strCutout: 1, Touches: 1, _id: 0 })
      .toArray();

    res.json(topTouches);
  } catch (error) {
    console.error('Error fetching top touches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Top assists - Mayores asistidores
app.get('/api/top-asistidores', async (req, res) => {
  try {
    if (!playersCollection) {
      return res.status(503).json({ error: 'Database connection not ready' });
    }

    const topAssists = await playersCollection
      .find({ Ast: { $exists: true, $ne: null } })
      .sort({ Ast: -1 })
      .limit(20)
      .project({ strPlayer: 1, strCutout: 1, Ast: 1, _id: 0 })
      .toArray();

    res.json(topAssists);
  } catch (error) {
    console.error('Error fetching top assists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});