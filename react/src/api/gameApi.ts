export const fetchGameData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/game-data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching game data:', error);
    return null;
  }
};

export const fetchPlayerData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/player/me');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching player data:', error);
    return null;
  }
};

export const fetchPlayersList = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/player/all');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching players list:', error);
    return null;
  }
};

export const updatePlayerState = async (updateData: any) => {
  try {
    const response = await fetch('http://localhost:3001/api/player/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error updating player state:', error);
    return null;
  }
};
